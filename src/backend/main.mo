import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";

import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  let SYSTEM_NUMBER = "01831097802";
  let INITIAL_SPINS = 5;
  let REFERRAL_BONUS = 15;
  let VIDEO_REWARD = 2;
  let ACTIVATION_FEE = 50;
  let SPIN_REWARDS : [Nat] = [5, 10, 15, 20, 25];

  let accessControlState = AccessControl.initState();
  let approvalState = UserApproval.initState(accessControlState);

  include MixinAuthorization(accessControlState);

  // Helper to calculate tomorrow's 10:00PM UTC+6 timestamp
  func computeTomorrow10pm() : Int {
    let nowNanos = Time.now();
    let nowMillis : Int = nowNanos / 1_000_000; // Convert to milliseconds

    let dayInMillis : Int = 24 * 60 * 60 * 1000;
    let tomorrowMillis : Int = nowMillis + dayInMillis;

    // Calculate days since epoch
    let daysSinceEpoch : Int = tomorrowMillis / dayInMillis;

    // Start of tomorrow in milliseconds (UTC)
    let startOfTomorrowMillis : Int = daysSinceEpoch * dayInMillis;

    // 10:00PM UTC+6 in milliseconds = 22 * 60 * 60 * 1000
    let timeOffsetMillis : Int = 22 * 60 * 60 * 1000;

    // Final timestamp in nanoseconds
    let finalMilliseconds : Int = startOfTomorrowMillis + timeOffsetMillis;
    finalMilliseconds * 1_000_000; // Convert back to nanoseconds
  };

  // New persistent countdown target
  var countdownTarget : Int = computeTomorrow10pm();

  type VideoReward = {
    videoId : Nat;
    watched : Bool;
    lastClaimed : Time.Time;
  };

  public type UserProfile = {
    balance : Nat;
    spinsLeft : Nat;
    lastSpinReset : Time.Time;
    referralCode : Text;
    referrer : ?Principal;
    videoRewards : [VideoReward];
    isActive : Bool;
  };

  type WithdrawalStatus = Text;

  type WithdrawalRequest = {
    id : Nat;
    principal : Principal;
    number : Text;
    amount : Nat;
    status : WithdrawalStatus;
    createdAt : Time.Time;
  };

  let profiles = Map.empty<Principal, UserProfile>();
  let activationRequests = Map.empty<Principal, Text>();
  let withdrawalRequests = Map.empty<Nat, WithdrawalRequest>();
  var nextRequestId = 0;

  let MIN_WITHDRAW_AMOUNT = 100;
  let MAX_DAILY_REQUESTS = 2;

  public type UserSummary = {
    principal : Principal;
    balance : Nat;
    isActive : Bool;
    referralCount : Nat;
  };

  public type AdminDashboard = {
    totalUsers : Nat;
    activeUsers : Nat;
    pendingActivations : Nat;
    users : [UserSummary];
    totalEarnings : Nat;
  };

  //// NEW DATA STRUCTURES ////

  // Notice Board
  public type Notice = {
    id : Nat;
    title : Text;
    content : Text;
    timestamp : Time.Time;
  };

  let notices = Map.empty<Nat, Notice>();
  var nextNoticeId = 1;

  // Digital Recharge Offers
  public type RechargeOffer = {
    id : Nat;
    operatorName : Text;
    title : Text;
    description : Text;
    timestamp : Time.Time;
  };

  let rechargeOffers = Map.empty<Nat, RechargeOffer>();
  var nextOfferId = 1;

  //// ADMIN-ONLY MANAGEMENT FUNCTIONS ////

  // Notices
  public shared ({ caller }) func addNotice(title : Text, content : Text) : async Nat {
    checkAdmin(caller);
    let notice : Notice = {
      id = nextNoticeId;
      title;
      content;
      timestamp = Time.now();
    };
    notices.add(nextNoticeId, notice);
    let id = nextNoticeId;
    nextNoticeId += 1;
    id;
  };

  public shared ({ caller }) func removeNotice(id : Nat) : async () {
    checkAdmin(caller);
    if (notices.containsKey(id)) {
      notices.remove(id);
    } else {
      Runtime.trap("Notice not found");
    };
  };

  // Recharge Offers
  public shared ({ caller }) func addRechargeOffer(operatorName : Text, title : Text, description : Text) : async Nat {
    checkAdmin(caller);
    let offer : RechargeOffer = {
      id = nextOfferId;
      operatorName;
      title;
      description;
      timestamp = Time.now();
    };
    rechargeOffers.add(nextOfferId, offer);
    let id = nextOfferId;
    nextOfferId += 1;
    id;
  };

  public shared ({ caller }) func removeRechargeOffer(id : Nat) : async () {
    checkAdmin(caller);
    if (rechargeOffers.containsKey(id)) {
      rechargeOffers.remove(id);
    } else {
      Runtime.trap("Recharge offer not found");
    };
  };

  //// USER-FACING QUERY FUNCTIONS ////

  public query ({ caller }) func getNotices() : async [Notice] {
    let noticeArray = notices.values().toArray();
    let sortedArray = noticeArray.sort(
      func(a, b) { Int.compare(b.timestamp, a.timestamp) }
    );
    sortedArray;
  };

  public query ({ caller }) func getRechargeOffers() : async [RechargeOffer] {
    rechargeOffers.values().toArray();
  };

  //// EXISTING FUNCTIONALITY ////

  func generateReferralCode(p : Principal) : Text {
    let t = p.toText();
    if (t.size() >= 8) {
      Text.fromIter(t.toArray().sliceToArray(0, 8).vals());
    } else {
      t;
    };
  };

  // Countdown functions (new)
  public shared ({ caller }) func setCountdownTarget(targetTime : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set countdown target");
    };
    countdownTarget := targetTime;
  };

  public query func getCountdownTarget() : async Int {
    countdownTarget;
  };

  // Withdrawal functions
  public shared ({ caller }) func submitWithdrawRequest(number : Text, amount : Nat) : async Nat {
    checkUserApproved(caller);

    if (amount < MIN_WITHDRAW_AMOUNT) {
      Runtime.trap("Amount must be at least 100 BDT");
    };

    let dailyRequests = getNumberOfTodaysRequests(caller);
    if (dailyRequests >= MAX_DAILY_REQUESTS) {
      Runtime.trap("You have reached the daily limit of withdrawal requests");
    };

    let request : WithdrawalRequest = {
      id = nextRequestId;
      principal = caller;
      number;
      amount;
      status = "pending";
      createdAt = Time.now();
    };

    withdrawalRequests.add(nextRequestId, request);

    nextRequestId += 1;
    request.id;
  };

  public shared ({ caller }) func adminApproveWithdraw(requestId : Nat) : async () {
    checkAdmin(caller);
    updateWithdrawRequestStatus(requestId, "successful");
  };

  public shared ({ caller }) func adminRejectWithdraw(requestId : Nat) : async () {
    checkAdmin(caller);
    updateWithdrawRequestStatus(requestId, "rejected");
  };

  public query ({ caller }) func getMyWithdrawRequests() : async [WithdrawalRequest] {
    checkUserApproved(caller);
    withdrawalRequests.values().toArray().filter(
      func(req) { req.principal == caller }
    );
  };

  public query ({ caller }) func getAllWithdrawRequests() : async [WithdrawalRequest] {
    checkAdmin(caller);
    withdrawalRequests.values().toArray();
  };

  func updateWithdrawRequestStatus(requestId : Nat, newStatus : WithdrawalStatus) {
    switch (withdrawalRequests.get(requestId)) {
      case (null) { Runtime.trap("Withdraw request not found") };
      case (?request) {
        if (request.status != "pending") {
          Runtime.trap("Withdraw request already processed");
        };

        let updatedRequest : WithdrawalRequest = {
          request with status = newStatus;
        };

        withdrawalRequests.add(requestId, updatedRequest);
      };
    };
  };

  func getNumberOfTodaysRequests(principal : Principal) : Nat {
    let now = Time.now();
    let oneDayNanos : Int = 86_400_000_000_000;

    var count = 0;
    for (req in withdrawalRequests.values()) {
      if (req.principal == principal and (now - req.createdAt) < oneDayNanos) {
        count += 1;
      };
    };
    count;
  };

  func checkAdmin(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  func checkUserApproved(caller : Principal) {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only approved users can perform this action");
    };
  };

  // User approval functions
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    checkAdmin(caller);
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    checkAdmin(caller);
    UserApproval.listApprovals(approvalState);
  };

  // Public info - no auth needed
  public query func getPayNumber() : async Text {
    SYSTEM_NUMBER;
  };

  // Required profile functions - no changes
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    profiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save their profile");
    };
    profiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(user);
  };

  public query ({ caller }) func getProfile() : async ?UserProfile {
    checkUserApproved(caller);
    profiles.get(caller);
  };

  // Admin-only: view all user profiles
  public query ({ caller }) func getAllUserProfiles() : async [(Principal, UserProfile)] {
    checkAdmin(caller);
    profiles.toArray();
  };

  // Authenticated user submits activation request
  public shared ({ caller }) func submitActivation(transactionNumber : Text, amount : Nat) : async Bool {
    checkUserApproved(caller);
    if (amount != ACTIVATION_FEE) {
      Runtime.trap("Incorrect amount sent. Please send exactly 50 BDT.");
    };

    activationRequests.add(caller, transactionNumber);

    switch (profiles.get(caller)) {
      case (null) {
        let newProfile : UserProfile = {
          balance = 0;
          spinsLeft = INITIAL_SPINS;
          lastSpinReset = Time.now();
          referralCode = generateReferralCode(caller);
          referrer = null;
          videoRewards = [];
          isActive = false;
        };
        profiles.add(caller, newProfile);
      };
      case (?_) {};
    };
    true;
  };

  // Authenticated user submits a referral code
  public shared ({ caller }) func submitReferralCode(referralCode : Text) : async Bool {
    checkUserApproved(caller);
    switch (profiles.get(caller)) {
      case (null) {
        Runtime.trap("User not found. Please activate your account first.");
      };
      case (?profile) {
        if (profile.isActive) {
          Runtime.trap("Cannot use referral code after account activation");
        };

        var foundReferrer : ?(Principal, UserProfile) = null;
        for ((p, rp) in profiles.entries()) {
          if (rp.referralCode == referralCode) {
            foundReferrer := ?(p, rp);
          };
        };

        switch (foundReferrer) {
          case (null) {
            Runtime.trap("Invalid referral code");
          };
          case (?found) {
            let (referrerId, _) = found;
            let updatedProfile : UserProfile = {
              balance = profile.balance;
              spinsLeft = profile.spinsLeft;
              lastSpinReset = profile.lastSpinReset;
              referralCode = profile.referralCode;
              referrer = ?referrerId;
              videoRewards = profile.videoRewards;
              isActive = profile.isActive;
            };
            profiles.add(caller, updatedProfile);
            true;
          };
        };
      };
    };
  };

  // Admin-only: approve an activation request
  public shared ({ caller }) func approveActivation(user : Principal) : async () {
    checkAdmin(caller);
    switch (activationRequests.get(user)) {
      case (null) { Runtime.trap("Activation request not found") };
      case (?_) {
        switch (profiles.get(user)) {
          case (null) { Runtime.trap("User profile not found") };
          case (?profile) {
            let updatedProfile : UserProfile = {
              balance = profile.balance + ACTIVATION_FEE;
              spinsLeft = profile.spinsLeft;
              lastSpinReset = profile.lastSpinReset;
              referralCode = profile.referralCode;
              referrer = profile.referrer;
              videoRewards = profile.videoRewards;
              isActive = profile.isActive;
            };
            profiles.add(user, updatedProfile);

            switch (profile.referrer) {
              case (?referrer) {
                switch (profiles.get(referrer)) {
                  case (null) {};
                  case (?refProfile) {
                    let updatedRefProfile : UserProfile = {
                      balance = refProfile.balance + REFERRAL_BONUS;
                      spinsLeft = refProfile.spinsLeft;
                      lastSpinReset = refProfile.lastSpinReset;
                      referralCode = refProfile.referralCode;
                      referrer = refProfile.referrer;
                      videoRewards = refProfile.videoRewards;
                      isActive = refProfile.isActive;
                    };
                    profiles.add(referrer, updatedRefProfile);
                  };
                };
              };
              case (null) {};
            };

            activationRequests.remove(user);
          };
        };
      };
    };
  };

  // Authenticated user spins
  public shared ({ caller }) func spin() : async Nat {
    checkUserApproved(caller);
    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("No account found. Activate your account first.") };
      case (?profile) {
        if (not profile.isActive) {
          Runtime.trap("Inactive account. Please pay activation fee (50 BDT).");
        };

        // Reset spins if 24 hours have passed
        let now = Time.now();
        let secondsElapsed = (now - profile.lastSpinReset) / 1_000_000_000;
        let spinsLeft = if (secondsElapsed >= 86400) { INITIAL_SPINS } else { profile.spinsLeft };
        let lastSpinReset = if (secondsElapsed >= 86400) { now } else { profile.lastSpinReset };

        if (spinsLeft == 0) {
          Runtime.trap("No spins left for today. Come back tomorrow!");
        };

        // Simple pseudo-random reward selection based on time
        let rewardIndex = Int.abs(now).toNat() % SPIN_REWARDS.size();
        let reward = SPIN_REWARDS[rewardIndex];

        let updatedProfile : UserProfile = {
          balance = profile.balance + reward;
          spinsLeft = spinsLeft - 1;
          lastSpinReset = lastSpinReset;
          referralCode = profile.referralCode;
          referrer = profile.referrer;
          videoRewards = profile.videoRewards;
          isActive = profile.isActive;
        };
        profiles.add(caller, updatedProfile);
        reward;
      };
    };
  };

  // Authenticated user watches a video
  public shared ({ caller }) func watchVideo(videoId : Nat) : async () {
    checkUserApproved(caller);
    if (videoId < 1 or videoId > 5) {
      Runtime.trap("Invalid video ID");
    };

    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("No account found. Activate your account first.") };
      case (?profile) {
        if (not profile.isActive) {
          Runtime.trap("Inactive account. Please pay activation fee (50 BDT).");
        };

        let now = Time.now();
        let oneDayNanos : Int = 86_400_000_000_000;

        // Check if video was already watched today
        var alreadyWatchedToday = false;
        for (reward in profile.videoRewards.vals()) {
          if (reward.videoId == videoId) {
            let elapsed = now - reward.lastClaimed;
            if (elapsed < oneDayNanos) {
              alreadyWatchedToday := true;
            };
          };
        };

        if (alreadyWatchedToday) {
          Runtime.trap("Video already watched today. Come back tomorrow!");
        };

        let newReward : VideoReward = {
          videoId = videoId;
          watched = true;
          lastClaimed = now;
        };

        // Replace or add the reward entry for this video
        let mutRewards = profile.videoRewards.toVarArray<VideoReward>();
        var found = false;
        for (i in Nat.range(0, mutRewards.size())) {
          if (mutRewards[i].videoId == videoId) {
            mutRewards[i] := newReward;
            found := true;
          };
        };
        var updatedRewards = mutRewards.toArray();
        if (not found) {
          updatedRewards := updatedRewards.concat([newReward]);
        };

        let updatedProfile : UserProfile = {
          balance = profile.balance + VIDEO_REWARD;
          spinsLeft = profile.spinsLeft;
          lastSpinReset = profile.lastSpinReset;
          referralCode = profile.referralCode;
          referrer = profile.referrer;
          videoRewards = updatedRewards;
          isActive = profile.isActive;
        };
        profiles.add(caller, updatedProfile);
      };
    };
  };

  // Admin-only: view all pending activation requests
  public query ({ caller }) func getActivationRequests() : async [(Principal, Text)] {
    checkAdmin(caller);
    var result : [(Principal, Text)] = [];
    for ((p, txn) in activationRequests.entries()) {
      result := result.concat([(p, txn)]);
    };
    result;
  };

  // Admin-only: assign roles to users
  public shared ({ caller }) func assignUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  func computeTotalEarnings() : Nat {
    var total : Nat = 0;
    for ((_, p) in profiles.entries()) {
      total += p.balance;
    };
    total;
  };

  func countReferrals(referrer : Principal) : Nat {
    var count = 0;
    for ((_, p) in profiles.entries()) {
      switch (p.referrer) {
        case (?r) { if (r == referrer) { count += 1 } };
        case (null) {};
      };
    };
    count;
  };

  // Admin-only: view dashboard stats
  public query ({ caller }) func getAdminDashboard() : async AdminDashboard {
    checkAdmin(caller);

    var activeUsers = 0;
    let pendingActivations = activationRequests.size();

    for ((_, p) in profiles.entries()) {
      if (p.isActive) {
        activeUsers += 1;
      };
    };

    let usersIter = profiles.keys();
    let userSummaries = usersIter.toArray().map(
      func(principal) {
        let profile = profiles.get(principal);
        switch (profile) {
          case (?p) {
            {
              principal;
              balance = p.balance;
              isActive = p.isActive;
              referralCount = countReferrals(principal);
            };
          };
          case (null) { { principal; balance = 0; isActive = false; referralCount = 0 } };
        };
      }
    );

    let dashboard : AdminDashboard = {
      totalUsers = profiles.size();
      activeUsers;
      pendingActivations;
      users = userSummaries;
      totalEarnings = computeTotalEarnings();
    };
    dashboard;
  };
};

