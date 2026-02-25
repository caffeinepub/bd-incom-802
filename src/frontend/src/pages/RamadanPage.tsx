import React, { useState, useEffect, useCallback } from 'react';
import { Moon, Clock, MapPin, Bell } from 'lucide-react';

type City = 'dhaka' | 'mymensingh';

interface PrayerTime {
  day: number;
  date: string;
  sehri: string;
  iftar: string;
}

// 2025 Ramadan schedule (1 March - 30 March 2025)
const DHAKA_TIMES: PrayerTime[] = [
  { day: 1,  date: '01 মার্চ', sehri: '05:02', iftar: '18:10' },
  { day: 2,  date: '02 মার্চ', sehri: '05:01', iftar: '18:11' },
  { day: 3,  date: '03 মার্চ', sehri: '05:00', iftar: '18:11' },
  { day: 4,  date: '04 মার্চ', sehri: '04:59', iftar: '18:12' },
  { day: 5,  date: '05 মার্চ', sehri: '04:58', iftar: '18:12' },
  { day: 6,  date: '06 মার্চ', sehri: '04:57', iftar: '18:13' },
  { day: 7,  date: '07 মার্চ', sehri: '04:56', iftar: '18:13' },
  { day: 8,  date: '08 মার্চ', sehri: '04:55', iftar: '18:14' },
  { day: 9,  date: '09 মার্চ', sehri: '04:54', iftar: '18:14' },
  { day: 10, date: '10 মার্চ', sehri: '04:53', iftar: '18:15' },
  { day: 11, date: '11 মার্চ', sehri: '04:52', iftar: '18:15' },
  { day: 12, date: '12 মার্চ', sehri: '04:51', iftar: '18:16' },
  { day: 13, date: '13 মার্চ', sehri: '04:50', iftar: '18:16' },
  { day: 14, date: '14 মার্চ', sehri: '04:49', iftar: '18:17' },
  { day: 15, date: '15 মার্চ', sehri: '04:48', iftar: '18:17' },
  { day: 16, date: '16 মার্চ', sehri: '04:47', iftar: '18:18' },
  { day: 17, date: '17 মার্চ', sehri: '04:46', iftar: '18:18' },
  { day: 18, date: '18 মার্চ', sehri: '04:45', iftar: '18:19' },
  { day: 19, date: '19 মার্চ', sehri: '04:44', iftar: '18:19' },
  { day: 20, date: '20 মার্চ', sehri: '04:43', iftar: '18:20' },
  { day: 21, date: '21 মার্চ', sehri: '04:42', iftar: '18:20' },
  { day: 22, date: '22 মার্চ', sehri: '04:41', iftar: '18:21' },
  { day: 23, date: '23 মার্চ', sehri: '04:40', iftar: '18:21' },
  { day: 24, date: '24 মার্চ', sehri: '04:39', iftar: '18:22' },
  { day: 25, date: '25 মার্চ', sehri: '04:38', iftar: '18:22' },
  { day: 26, date: '26 মার্চ', sehri: '04:37', iftar: '18:23' },
  { day: 27, date: '27 মার্চ', sehri: '04:36', iftar: '18:23' },
  { day: 28, date: '28 মার্চ', sehri: '04:35', iftar: '18:24' },
  { day: 29, date: '29 মার্চ', sehri: '04:34', iftar: '18:24' },
  { day: 30, date: '30 মার্চ', sehri: '04:33', iftar: '18:25' },
];

const MYMENSINGH_TIMES: PrayerTime[] = [
  { day: 1,  date: '01 মার্চ', sehri: '04:57', iftar: '18:07' },
  { day: 2,  date: '02 মার্চ', sehri: '04:56', iftar: '18:08' },
  { day: 3,  date: '03 মার্চ', sehri: '04:55', iftar: '18:08' },
  { day: 4,  date: '04 মার্চ', sehri: '04:54', iftar: '18:09' },
  { day: 5,  date: '05 মার্চ', sehri: '04:53', iftar: '18:09' },
  { day: 6,  date: '06 মার্চ', sehri: '04:52', iftar: '18:10' },
  { day: 7,  date: '07 মার্চ', sehri: '04:51', iftar: '18:10' },
  { day: 8,  date: '08 মার্চ', sehri: '04:50', iftar: '18:11' },
  { day: 9,  date: '09 মার্চ', sehri: '04:49', iftar: '18:11' },
  { day: 10, date: '10 মার্চ', sehri: '04:48', iftar: '18:12' },
  { day: 11, date: '11 মার্চ', sehri: '04:47', iftar: '18:12' },
  { day: 12, date: '12 মার্চ', sehri: '04:46', iftar: '18:13' },
  { day: 13, date: '13 মার্চ', sehri: '04:45', iftar: '18:13' },
  { day: 14, date: '14 মার্চ', sehri: '04:44', iftar: '18:14' },
  { day: 15, date: '15 মার্চ', sehri: '04:43', iftar: '18:14' },
  { day: 16, date: '16 মার্চ', sehri: '04:42', iftar: '18:15' },
  { day: 17, date: '17 মার্চ', sehri: '04:41', iftar: '18:15' },
  { day: 18, date: '18 মার্চ', sehri: '04:40', iftar: '18:16' },
  { day: 19, date: '19 মার্চ', sehri: '04:39', iftar: '18:16' },
  { day: 20, date: '20 মার্চ', sehri: '04:38', iftar: '18:17' },
  { day: 21, date: '21 মার্চ', sehri: '04:37', iftar: '18:17' },
  { day: 22, date: '22 মার্চ', sehri: '04:36', iftar: '18:18' },
  { day: 23, date: '23 মার্চ', sehri: '04:35', iftar: '18:18' },
  { day: 24, date: '24 মার্চ', sehri: '04:34', iftar: '18:19' },
  { day: 25, date: '25 মার্চ', sehri: '04:33', iftar: '18:19' },
  { day: 26, date: '26 মার্চ', sehri: '04:32', iftar: '18:20' },
  { day: 27, date: '27 মার্চ', sehri: '04:31', iftar: '18:20' },
  { day: 28, date: '28 মার্চ', sehri: '04:30', iftar: '18:21' },
  { day: 29, date: '29 মার্চ', sehri: '04:29', iftar: '18:21' },
  { day: 30, date: '30 মার্চ', sehri: '04:28', iftar: '18:22' },
];

function parseTimeToday(timeStr: string): Date {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface TimerState {
  label: string;
  countdown: number; // seconds
  isAlert: boolean;
  alertLabel: string;
}

export default function RamadanPage() {
  const [city, setCity] = useState<City>('dhaka');
  const [timerState, setTimerState] = useState<TimerState>({
    label: '',
    countdown: 0,
    isAlert: false,
    alertLabel: '',
  });

  const schedule = city === 'dhaka' ? DHAKA_TIMES : MYMENSINGH_TIMES;

  // Get today's date info
  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth(); // 0-indexed, March = 2

  // Find today's row (Ramadan 2025 = March)
  const todayRow = todayMonth === 2 ? schedule.find(r => r.day === todayDay) : null;

  const computeTimer = useCallback(() => {
    const now = new Date();
    const nowMs = now.getTime();

    if (!todayRow) {
      setTimerState({ label: '', countdown: 0, isAlert: false, alertLabel: '' });
      return;
    }

    const sehriTime = parseTimeToday(todayRow.sehri);
    const iftarTime = parseTimeToday(todayRow.iftar);
    const twoHours = 2 * 60 * 60 * 1000;
    const fifteenMin = 15 * 60 * 1000;

    // Check Sehri alert (within 15 min after sehri time)
    const sehriMs = sehriTime.getTime();
    if (nowMs >= sehriMs && nowMs < sehriMs + fifteenMin) {
      setTimerState({
        label: '',
        countdown: 0,
        isAlert: true,
        alertLabel: '🌙 সেহরির সময় হয়েছে!',
      });
      return;
    }

    // Check Iftar alert (within 15 min after iftar time)
    const iftarMs = iftarTime.getTime();
    if (nowMs >= iftarMs && nowMs < iftarMs + fifteenMin) {
      setTimerState({
        label: '',
        countdown: 0,
        isAlert: true,
        alertLabel: '🌅 ইফতারের সময় হয়েছে!',
      });
      return;
    }

    // Check countdown to Sehri (2 hours before)
    if (nowMs >= sehriMs - twoHours && nowMs < sehriMs) {
      const diff = Math.floor((sehriMs - nowMs) / 1000);
      setTimerState({
        label: 'সেহরির সময় হচ্ছে',
        countdown: diff,
        isAlert: false,
        alertLabel: '',
      });
      return;
    }

    // Check countdown to Iftar (2 hours before)
    if (nowMs >= iftarMs - twoHours && nowMs < iftarMs) {
      const diff = Math.floor((iftarMs - nowMs) / 1000);
      setTimerState({
        label: 'ইফতারের সময় হচ্ছে',
        countdown: diff,
        isAlert: false,
        alertLabel: '',
      });
      return;
    }

    setTimerState({ label: '', countdown: 0, isAlert: false, alertLabel: '' });
  }, [todayRow]);

  useEffect(() => {
    computeTimer();
    const interval = setInterval(computeTimer, 1000);
    return () => clearInterval(interval);
  }, [computeTimer]);

  const showTimer = timerState.countdown > 0 && !timerState.isAlert;
  const showAlert = timerState.isAlert;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Moon className="w-6 h-6 text-gold" />
          <h1 className="text-2xl font-bold text-gold font-bangla">রমজান ১৪৪৬</h1>
          <Moon className="w-6 h-6 text-gold" />
        </div>
        <p className="text-muted-foreground text-sm font-bangla">সেহরি ও ইফতারের সময়সূচি</p>
      </div>

      {/* Alert Banner */}
      {showAlert && (
        <div
          className="rounded-xl p-4 text-center font-bold text-lg font-bangla animate-bounce-in"
          style={{
            background: 'linear-gradient(135deg, oklch(0.55 0.18 75), oklch(0.45 0.20 55))',
            color: 'oklch(0.10 0.02 75)',
            boxShadow: '0 0 30px oklch(0.78 0.16 75 / 0.6)',
            border: '2px solid oklch(0.78 0.16 75)',
          }}
        >
          <Bell className="inline w-5 h-5 mr-2 animate-bounce" />
          {timerState.alertLabel}
        </div>
      )}

      {/* Countdown Timer */}
      {showTimer && (
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: 'linear-gradient(135deg, oklch(0.18 0.06 145), oklch(0.22 0.08 145))',
            border: '1px solid oklch(0.72 0.18 145 / 0.4)',
            boxShadow: '0 0 20px oklch(0.72 0.18 145 / 0.2)',
          }}
        >
          <p className="text-sm text-muted-foreground font-bangla mb-1">{timerState.label}</p>
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span
              className="text-3xl font-bold tabular-nums"
              style={{ color: 'oklch(0.72 0.18 145)', fontFamily: 'monospace' }}
            >
              {formatCountdown(timerState.countdown)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">বাকি সময়</p>
        </div>
      )}

      {/* City Selector */}
      <div
        className="rounded-xl p-3 flex items-center gap-3"
        style={{ background: 'oklch(0.16 0.025 145)', border: '1px solid oklch(0.28 0.04 145)' }}
      >
        <MapPin className="w-4 h-4 text-gold shrink-0" />
        <span className="text-sm text-muted-foreground font-bangla flex-1">শহর নির্বাচন করুন:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setCity('dhaka')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold font-bangla transition-all ${
              city === 'dhaka'
                ? 'text-card-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            style={
              city === 'dhaka'
                ? { background: 'linear-gradient(135deg, oklch(0.78 0.16 75), oklch(0.68 0.18 55))', color: 'oklch(0.10 0.02 75)' }
                : { background: 'oklch(0.22 0.03 145)' }
            }
          >
            ঢাকা
          </button>
          <button
            onClick={() => setCity('mymensingh')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold font-bangla transition-all ${
              city === 'mymensingh'
                ? 'text-card-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            style={
              city === 'mymensingh'
                ? { background: 'linear-gradient(135deg, oklch(0.78 0.16 75), oklch(0.68 0.18 55))', color: 'oklch(0.10 0.02 75)' }
                : { background: 'oklch(0.22 0.03 145)' }
            }
          >
            ময়মনসিংহ
          </button>
        </div>
      </div>

      {/* Today's Times Card */}
      {todayRow && (
        <div
          className="rounded-xl p-4"
          style={{
            background: 'linear-gradient(135deg, oklch(0.20 0.08 145), oklch(0.18 0.06 145))',
            border: '2px solid oklch(0.72 0.18 145 / 0.5)',
            boxShadow: '0 0 20px oklch(0.72 0.18 145 / 0.15)',
          }}
        >
          <p className="text-xs text-primary font-semibold mb-2 font-bangla">আজকের সময়সূচি — {todayRow.date}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-xs text-muted-foreground font-bangla mb-1">🌙 সেহরি</p>
              <p className="text-2xl font-bold tabular-nums" style={{ color: 'oklch(0.72 0.18 145)' }}>
                {todayRow.sehri}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground font-bangla mb-1">🌅 ইফতার</p>
              <p className="text-2xl font-bold tabular-nums" style={{ color: 'oklch(0.78 0.16 75)' }}>
                {todayRow.iftar}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Full Schedule Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid oklch(0.28 0.04 145)' }}
      >
        <div
          className="px-4 py-2.5 flex items-center gap-2"
          style={{ background: 'oklch(0.20 0.06 145)' }}
        >
          <Moon className="w-4 h-4 text-gold" />
          <span className="text-sm font-semibold text-gold font-bangla">
            {city === 'dhaka' ? 'ঢাকা' : 'ময়মনসিংহ'} — সম্পূর্ণ রমজান সময়সূচি ২০২৫
          </span>
        </div>

        {/* Table Header */}
        <div
          className="grid grid-cols-4 px-3 py-2 text-xs font-semibold text-muted-foreground"
          style={{ background: 'oklch(0.18 0.04 145)', borderBottom: '1px solid oklch(0.28 0.04 145)' }}
        >
          <span className="font-bangla">রোজা</span>
          <span className="font-bangla">তারিখ</span>
          <span className="font-bangla text-center">🌙 সেহরি</span>
          <span className="font-bangla text-center">🌅 ইফতার</span>
        </div>

        {/* Table Rows */}
        <div className="max-h-80 overflow-y-auto">
          {schedule.map((row) => {
            const isToday = todayMonth === 2 && todayDay === row.day;
            return (
              <div
                key={row.day}
                className="grid grid-cols-4 px-3 py-2.5 text-sm items-center"
                style={{
                  background: isToday
                    ? 'linear-gradient(90deg, oklch(0.22 0.08 145 / 0.8), oklch(0.20 0.06 145 / 0.8))'
                    : row.day % 2 === 0
                    ? 'oklch(0.17 0.025 145)'
                    : 'oklch(0.15 0.02 145)',
                  borderBottom: '1px solid oklch(0.22 0.03 145)',
                  borderLeft: isToday ? '3px solid oklch(0.72 0.18 145)' : '3px solid transparent',
                }}
              >
                <span
                  className="font-bold text-xs"
                  style={{ color: isToday ? 'oklch(0.72 0.18 145)' : 'oklch(0.65 0.04 145)' }}
                >
                  {row.day}
                  {isToday && <span className="ml-1 text-[9px] font-bangla">আজ</span>}
                </span>
                <span className="text-xs text-muted-foreground font-bangla">{row.date}</span>
                <span
                  className="text-center font-semibold tabular-nums text-xs"
                  style={{ color: 'oklch(0.72 0.18 145)' }}
                >
                  {row.sehri}
                </span>
                <span
                  className="text-center font-semibold tabular-nums text-xs"
                  style={{ color: 'oklch(0.78 0.16 75)' }}
                >
                  {row.iftar}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground font-bangla pb-2">
        * সময়গুলো আনুমানিক। স্থানীয় ইমামের নির্দেশনা অনুসরণ করুন।
      </p>
    </div>
  );
}
