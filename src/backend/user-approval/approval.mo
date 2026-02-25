import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import AccessControl "../authorization/access-control";

module {
  public type ApprovalStatus = {
    #approved;
    #rejected;
    #pending;
  };

  public type UserApprovalState = {
    var approvalStatus : Map.Map<Principal, ApprovalStatus>;
  };

  public func initState(accessControlState : AccessControl.AccessControlState) : UserApprovalState {
    var approvalStatus = Map.empty<Principal, ApprovalStatus>();
    for ((principal, role) in accessControlState.userRoles.entries()) {
      let status = if (role == #admin) {
        #approved;
      } else {
        #pending;
      };
      approvalStatus.add(principal, status);
    };
    { var approvalStatus };
  };

  public func isApproved(state : UserApprovalState, caller : Principal) : Bool {
    state.approvalStatus.get(caller) == ?#approved;
  };

  public func requestApproval(state : UserApprovalState, caller : Principal) {
    if (state.approvalStatus.get(caller) == null) {
      setApproval(state, caller, #pending);
    };
  };

  public func setApproval(state : UserApprovalState, user : Principal, approval : ApprovalStatus) {
    state.approvalStatus.add(user, approval);
  };

  public type UserApprovalInfo = {
    principal : Principal;
    status : ApprovalStatus;
  };

  public func listApprovals(state : UserApprovalState) : [UserApprovalInfo] {
    let infos = state.approvalStatus.map<Principal, ApprovalStatus, UserApprovalInfo>(
      func(principal, status) {
        {
          principal;
          status;
        };
      }
    );
    infos.values().toArray();
  };
};
