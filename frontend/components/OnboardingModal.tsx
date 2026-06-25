"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Sparkles,
  Zap,
  Moon,
  MessageSquare,
  HelpCircle,
  Award,
  X,
} from "lucide-react";
import type { Chronotype, UserProfile } from "@/lib/types";

interface OnboardingModalProps {
  onSave: (updates: Partial<UserProfile>) => Promise<boolean>;
  onComplete: () => void;
  mode?: "onboarding" | "profile" | "page";
  onClose?: () => void;
}

interface QuizQuestion {
  id: number;
  text: string;
  options: {
    text: string;
    points: number;
  }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: "เวลาตื่นนอนที่รู้สึกสบายและธรรมชาติที่สุดในวันหยุดของคุณคือช่วงเวลาใด?",
    options: [
      { text: "05:00 - 07:00 น. (ตื่นเช้าธรรมชาติ)", points: 3 },
      { text: "07:00 - 09:00 น. (ตื่นปกติ)", points: 2 },
      { text: "09:00 น. เป็นต้นไป (ตื่นสาย)", points: 1 },
    ],
  },
  {
    id: 2,
    text: "ช่วงเวลาใดที่คุณรู้สึกว่าสมองปลอดโปร่ง มีพลัง และโฟกัสกับงานยากๆ ได้ดีที่สุด?",
    options: [
      { text: "ช่วงเช้าตรู่ถึงก่อนเที่ยง (06:00 - 12:00 น.)", points: 3 },
      { text: "ช่วงบ่ายถึงเย็น (12:00 - 17:00 น.)", points: 2 },
      { text: "ช่วงค่ำถึงดึก (18:00 น. เป็นต้นไป)", points: 1 },
    ],
  },
  {
    id: 3,
    text: "หากจำเป็นต้องตื่นนอนเวลา 06:00 น. คุณจะรู้สึกอย่างไร?",
    options: [
      { text: "สดชื่น ตื่นได้สบายๆ ไม่ยากเย็น", points: 3 },
      { text: "เพลียเล็กน้อย ต้องใช้เวลาปรับตัวหรือมีตัวช่วย", points: 2 },
      { text: "ทรมานมาก รู้สึกเหมือนไม่ได้นอน", points: 1 },
    ],
  },
  {
    id: 4,
    text: "เวลาที่คุณเริ่มรู้สึกง่วงนอนและพร้อมจะเข้านอนจริงๆ คือเวลาใด?",
    options: [
      { text: "20:00 - 22:00 น.", points: 3 },
      { text: "22:00 - 00:00 น.", points: 2 },
      { text: "00:00 น. เป็นต้นไป", points: 1 },
    ],
  },
  {
    id: 5,
    text: "หากต้องออกกำลังกายอย่างเต็มที่ คุณคิดว่าช่วงเวลาใดที่คุณพร้อมที่สุด?",
    options: [
      { text: "ช่วงเช้าตรู่ถึงสาย", points: 3 },
      { text: "ช่วงบ่ายหรือเย็นก่อนค่ำ", points: 2 },
      { text: "ช่วงค่ำหรือดึก", points: 1 },
    ],
  },
  {
    id: 6,
    text: "ความรู้สึกของคุณในช่วง 30 นาทีแรกหลังจากตื่นนอนตอนเช้าเป็นอย่างไร?",
    options: [
      { text: "ตื่นตัว กระปรี้กระเปร่า พร้อมทำกิจกรรมต่างๆ", points: 3 },
      { text: "พอตื่นได้ มึนๆ เล็กน้อย แต่ค่อยๆ ดีขึ้น", points: 2 },
      { text: "ง่วงซึม อยากนอนต่อ และไม่อยากคุยกับใคร", points: 1 },
    ],
  },
  {
    id: 7,
    text: "ในชั่วโมงแรกหลังจากตื่นนอน คุณมีความรู้สึกหิวหรืออยากอาหารมากน้อยแค่ไหน?",
    options: [
      { text: "หิวมาก พร้อมทานมื้อเช้าแบบจัดเต็ม", points: 3 },
      { text: "หิวปานกลาง ทานอะไรเบาๆ รองท้องได้", points: 2 },
      { text: "ไม่รู้สึกหิวเลย หรือไม่อยากทานอะไรเลย", points: 1 },
    ],
  },
  {
    id: 8,
    text: "หากต้องเตรียมข้อมูลสำคัญที่ต้องใช้พลังสมองสูงสุด คุณชอบทำช่วงเวลาไหน?",
    options: [
      { text: "ตื่นเช้ามาทำตอนสมองยังสดใหม่", points: 3 },
      { text: "ทำระหว่างวันหรือช่วงบ่ายๆ เย็นๆ", points: 2 },
      { text: "ทำช่วงดึกสงัด เงียบสงบไม่มีคนรบกวน", points: 1 },
    ],
  },
  {
    id: 9,
    text: "หากต้องไปร่วมงานสังคมหรืองานสังสรรค์ที่จะจบเวลา 02:00 น. คุณรู้สึกอย่างไร?",
    options: [
      { text: "เหนื่อยล้ามาก อยากกลับบ้านตั้งแต่สี่ทุ่ม", points: 3 },
      { text: "อยู่ได้ แต่อาจจะมีหาวหรือเริ่มเฉื่อยในช่วงท้าย", points: 2 },
      { text: "สบายมาก เป็นช่วงเวลาที่สนุกและมีพลังเต็มเปี่ยม", points: 1 },
    ],
  },
  {
    id: 10,
    text: "คุณนิยามตัวเองว่าใกล้เคียงกับพฤติกรรมในข้อใดมากที่สุด?",
    options: [
      { text: "คนตื่นเช้า (Morning Person) ชอบทำงานตอนเช้า", points: 3 },
      { text: "คนตื่นปกติ ปรับตัวได้ตามสถานการณ์", points: 2 },
      { text: "คนชอบนอนดึก (Night Person) ไอเดียแล่นตอนค่ำ", points: 1 },
    ],
  },
];

export default function OnboardingModal({
  onSave,
  onComplete,
  mode = "onboarding",
  onClose,
}: OnboardingModalProps) {
  const [step, setStep] = useState(1); // 1: Welcome, 2: Quiz, 3: Result, 4: Peak/Dip Setup, 5: LINE Setup, 6: Success
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(10).fill(0));
  
  const [chronotype, setChronotype] = useState<Chronotype | "">("");
  const [peakStart, setPeakStart] = useState("");
  const [peakEnd, setPeakEnd] = useState("");
  const [dipStart, setDipStart] = useState("");
  const [dipEnd, setDipEnd] = useState("");
  const [lineUserId, setLineUserId] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalQuestions = QUIZ_QUESTIONS.length;

  const getScoreResult = (score: number) => {
    if (score >= 24) {
      return {
        key: "Morning Lark" as Chronotype,
        label: "Morning Lark (นกเช้าตรู่)",
        emoji: "🐦",
        description: "คุณกระปรี้กระเปร่าที่สุดในตอนเช้า สมองแล่นได้ดีที่สุดในช่วงสาย และชอบเข้านอนเร็วเพื่อตื่นมารับเช้าวันใหม่",
        gradient: "from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/30",
        badgeColor: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        defaultPeakStart: "07:00",
        defaultPeakEnd: "11:00",
        defaultDipStart: "14:00",
        defaultDipEnd: "16:00",
      };
    } else if (score >= 16) {
      return {
        key: "Third Bird" as Chronotype,
        label: "Third Bird (นกกลางวัน)",
        emoji: "🦅",
        description: "คุณอยู่ตรงกลาง มีความยืดหยุ่นสูง สามารถปรับตัวได้ดีทั้งการทำกิจกรรมกลางวัน และมีพลังสูงช่วงสายกับบ่ายแก่ๆ",
        gradient: "from-sky-500/20 via-indigo-500/10 to-transparent border-sky-500/30",
        badgeColor: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
        defaultPeakStart: "09:00",
        defaultPeakEnd: "12:00",
        defaultDipStart: "15:00",
        defaultDipEnd: "17:00",
      };
    } else {
      return {
        key: "Night Owl" as Chronotype,
        label: "Night Owl (นกฮูกราตรี)",
        emoji: "🦉",
        description: "คุณทำงานได้อย่างมีประสิทธิภาพและสร้างสรรค์ในยามค่ำคืน ร่างกายทำงานดีที่สุดเมื่อได้นอนตื่นสายในตอนเช้า",
        gradient: "from-purple-500/20 via-pink-500/10 to-transparent border-purple-500/30",
        badgeColor: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
        defaultPeakStart: "20:00",
        defaultPeakEnd: "00:00",
        defaultDipStart: "09:00",
        defaultDipEnd: "11:00",
      };
    }
  };

  const handleSelectOption = (points: number) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIdx] = points;
    setAnswers(updatedAnswers);

    setError("");

    if (currentQuestionIdx < totalQuestions - 1) {
      // Auto-advance with short delay for feedback feel
      setTimeout(() => {
        setCurrentQuestionIdx((idx) => idx + 1);
      }, 250);
    } else {
      // Finished all questions, calculate result and move to step 3
      const totalScore = updatedAnswers.reduce((sum, val) => sum + val, 0);
      const res = getScoreResult(totalScore);
      setChronotype(res.key);
      setPeakStart(res.defaultPeakStart);
      setPeakEnd(res.defaultPeakEnd);
      setDipStart(res.defaultDipStart);
      setDipEnd(res.defaultDipEnd);

      setTimeout(() => {
        setStep(3);
      }, 300);
    }
  };

  const handleBack = () => {
    setError("");
    if (step === 2) {
      if (currentQuestionIdx > 0) {
        setCurrentQuestionIdx((idx) => idx - 1);
      } else {
        setStep(1);
      }
    } else {
      setStep((s) => s - 1);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
      setCurrentQuestionIdx(0);
      setAnswers(Array(10).fill(0));
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      if (!peakStart || !peakEnd) {
        setError("กรุณากรอกเวลาเริ่มต้นและสิ้นสุดสำหรับ Peak Time");
        return;
      }
      setStep(5);
    } else if (step === 5) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const success = await onSave({
        chronotype: chronotype as Chronotype,
        peak_time_start: peakStart,
        peak_time_end: peakEnd,
        dip_time_start: dipStart || null,
        dip_time_end: dipEnd || null,
        line_user_id: lineUserId.trim() || null,
      });

      if (success) {
        if (mode === "profile") {
          onComplete();
        } else {
          setStep(6);
        }
      } else {
        setError("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const currentScore = answers.reduce((sum, val) => sum + val, 0);
  const resultInfo = chronotype ? getScoreResult(currentScore) : null;

  const cardContent = (
    <div className="relative w-full max-w-lg min-w-[320px] md:min-w-[460px] flex-shrink-0 overflow-hidden border border-zinc-800 bg-zinc-900 rounded-2xl shadow-2xl flex flex-col max-h-[95vh] md:max-h-[90vh]">
      
      {/* Header decoration */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      {/* Close Button if on Profile page */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 transition-colors p-1.5 rounded-lg border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800 cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Header / Step Progress */}
      {step !== 6 && (
        <div className="px-6 pt-8 pb-4 flex items-center justify-between border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-zinc-400">
              {step === 1 && "ค้นหา Chronotype"}
              {step === 2 && `แบบทดสอบ (ข้อ ${currentQuestionIdx + 1}/${totalQuestions})`}
              {step === 3 && "ผลลัพธ์นาฬิกาชีวิต"}
              {step === 4 && "ตั้งค่าช่วงเวลาพลังงาน"}
              {step === 5 && "เปิดใช้งานแจ้งเตือน LINE"}
            </span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? "w-6 bg-indigo-500"
                    : s < step
                    ? "w-2 bg-indigo-500/40"
                    : "w-2 bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Form Body */}
      <div className="p-6 overflow-y-auto flex-1">
        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-xs font-medium text-red-400">
            {error}
          </div>
        )}

        {/* STEP 1: Welcome & Intro */}
        {step === 1 && (
          <div className="animate-fade-up flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-2">
              <HelpCircle className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-xl font-extrabold text-zinc-100 leading-tight">
              ค้นหานาฬิกาชีวิต (Chronotype) 🧬
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              เนื่องจากระดับพลังงานและสมาธิในแต่ละวันของทุกคนมีความแตกต่างกัน 
              เพื่อให้ระบบสามารถจัดลำดับงานได้สอดคล้องกับพฤติกรรมตามธรรมชาติของคุณ 
              มาทำแบบทดสอบง่ายๆ 10 ข้อเพื่อหาช่วงเวลา Peak และ Dip ที่แท้จริงของคุณกันครับ
            </p>

            <div className="mt-2 bg-zinc-950/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col gap-3">
              <div className="text-xs font-bold text-zinc-300 tracking-wide uppercase">กลุ่มพลังงานหลัก:</div>
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span className="text-xl">🐦</span>
                <div>
                  <strong className="text-zinc-200">Morning Lark (นกเช้า)</strong>
                  <p className="text-[11px] text-zinc-500 mt-0.5">แอคทีฟสุดขีดช่วงเช้า หัวแล่นตั้งแต่ตื่น</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span className="text-xl">🦅</span>
                <div>
                  <strong className="text-zinc-200">Third Bird (นกกลางวัน)</strong>
                  <p className="text-[11px] text-zinc-500 mt-0.5">ทำงานได้สม่ำเสมอช่วงสาย บ่าย และปรับตัวเก่ง</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span className="text-xl">🦉</span>
                <div>
                  <strong className="text-zinc-200">Night Owl (นกฮูกราตรี)</strong>
                  <p className="text-[11px] text-zinc-500 mt-0.5">ไอเดียกระฉูดช่วงดึก แต่ช่วงเช้าจะสมองช้าเล็กน้อย</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: The Quiz Questions */}
        {step === 2 && (
          <div className="animate-fade-up flex flex-col gap-5">
            {/* Question Progress bar */}
            <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-1 transition-all duration-300"
                style={{ width: `${(currentQuestionIdx / totalQuestions) * 100}%` }}
              />
            </div>

            <div>
              <span className="text-xs font-bold text-indigo-400 tracking-wide uppercase">
                คำถามข้อที่ {currentQuestionIdx + 1}
              </span>
              <h3 className="text-base font-bold text-zinc-100 mt-1 leading-relaxed">
                {QUIZ_QUESTIONS[currentQuestionIdx].text}
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              {QUIZ_QUESTIONS[currentQuestionIdx].options.map((opt, i) => {
                const isSelected = answers[currentQuestionIdx] === opt.points;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(opt.points)}
                    className={`w-full text-left p-4 rounded-xl border text-xs font-medium transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-indigo-500/10 border-indigo-500 text-indigo-300"
                        : "border-zinc-800 bg-zinc-950/20 hover:border-zinc-700 hover:bg-zinc-950/50 text-zinc-300"
                    }`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Quiz Result card */}
        {step === 3 && resultInfo && (
          <div className="animate-fade-up flex flex-col gap-4">
            <div className="text-center py-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">วิเคราะห์ผลเสร็จสิ้น!</span>
              <h2 className="text-xl font-black text-zinc-100 mt-1">ประเภทนาฬิกาชีวิตของคุณคือ</h2>
            </div>

            <div className={`p-6 rounded-2xl border bg-gradient-to-br ${resultInfo.gradient} flex flex-col items-center text-center gap-4 shadow-xl`}>
              <span className="text-6xl select-none animate-bounce">{resultInfo.emoji}</span>
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase ${resultInfo.badgeColor}`}>
                  {resultInfo.label}
                </span>
                <p className="text-xs text-zinc-300 mt-4 leading-relaxed font-medium">
                  {resultInfo.description}
                </p>
              </div>
            </div>

            <div className="bg-zinc-950/30 border border-zinc-800 p-4 rounded-xl flex gap-3.5 items-start">
              <Clock className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-zinc-400 leading-relaxed">
                <strong className="text-zinc-200">ข้อแนะนำเพิ่มเติม:</strong> ระบบได้ประเมินเวลาแนะนำสำหรับงานที่ใช้สมาธิสูง (Peak Time) และช่วงอ่อนล้า (Dip Time) ให้คุณในหน้าถัดไป เพื่อให้คุณกดยืนยันหรือปรับเปลี่ยนครับ
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Confirm Peak/Dip Times */}
        {step === 4 && (
          <div className="animate-fade-up flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-extrabold text-zinc-100">ปรับแต่งช่วงเวลาพลังงานของคุณ 🕰️</h2>
              <p className="text-xs text-zinc-400 mt-1">ปรับเปลี่ยนเวลาตามลักษณะการทำงานจริงของคุณได้ตลอดเวลา</p>
            </div>

            {/* Peak Time */}
            <div className="p-5 border border-emerald-500/10 bg-emerald-500/5 rounded-xl flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2 border-b border-emerald-500/10">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🔥 Peak Time (ช่วงที่มีพลังสูง)</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">เวลาเริ่ม</label>
                  <input
                    type="time"
                    value={peakStart}
                    onChange={(e) => setPeakStart(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">เวลาจบ</label>
                  <input
                    type="time"
                    value={peakEnd}
                    onChange={(e) => setPeakEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Dip Time */}
            <div className="p-5 border border-amber-500/10 bg-amber-500/5 rounded-xl flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2 border-b border-amber-500/10">
                <Moon className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">😴 Dip Time (ช่วงที่พลังงานต่ำ)</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">เวลาเริ่ม</label>
                  <input
                    type="time"
                    value={dipStart}
                    onChange={(e) => setDipStart(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">เวลาจบ</label>
                  <input
                    type="time"
                    value={dipEnd}
                    onChange={(e) => setDipEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: LINE User ID Setup */}
        {step === 5 && (
          <div className="animate-fade-up flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-zinc-100">แจ้งเตือนผ่าน LINE 💬</h2>
                <p className="text-xs text-zinc-400">ระบบจะช่วยส่งแจ้งเตือนงานก่อนเริ่ม 5 นาที</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  LINE User ID
                </label>
                <input
                  type="text"
                  value={lineUserId}
                  onChange={(e) => setLineUserId(e.target.value)}
                  placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-650 focus:border-emerald-500 outline-none transition-colors font-mono"
                />
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/50 flex flex-col gap-2">
                <span className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-wide">💡 วิธีหา LINE User ID ของคุณ:</span>
                <ol className="list-decimal list-inside text-[11px] text-zinc-400 leading-relaxed space-y-1">
                  <li>แอดไลน์บอทของเราเพื่อดึงข้อมูล</li>
                  <li>ส่งข้อความใดๆ ก็ได้หาบอท</li>
                  <li>บอทจะส่งข้อความตอบกลับเป็น ID ของคุณทันที</li>
                  <li>นำค่ารหัสเริ่มต้นด้วยตัว <strong className="text-zinc-350 font-mono">U</strong> มาวางด้านบน</li>
                </ol>
              </div>

              {mode === "profile" ? (
                <p className="text-[10px] text-zinc-500 text-center italic">
                  * คุณสามารถกดข้ามขั้นตอนนี้ได้ หากบันทึกไลน์ไว้เรียบร้อยแล้ว
                </p>
              ) : (
                <p className="text-[10px] text-zinc-500 text-center italic">
                  * หากไม่ต้องการรับแจ้งเตือน สามารถปล่อยว่างและกดบันทึกได้เลย
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: Success screen */}
        {step === 6 && (
          <div className="animate-fade-up flex flex-col items-center justify-center text-center py-8 gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2">
              <Award className="w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-zinc-100">ยินดีต้อนรับสู่ Smart Scheduler! 🎉</h2>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              การตั้งค่าข้อมูลส่วนตัวนาฬิกาชีวิตเสร็จสมบูรณ์ ระบบพร้อมจำลองช่วงเวลาทำงานที่เหมาะสมให้คุณแล้ว
            </p>
            
            <button
              onClick={onComplete}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg hover:shadow-indigo-500/20 cursor-pointer transition-all"
            >
              เริ่มต้นเข้าสู่ระบบ 🚀
            </button>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      {step !== 6 && (
        <div className="px-6 py-4 bg-zinc-950/40 border-t border-zinc-800/60 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                onClick={handleBack}
                disabled={submitting}
                className="px-4 py-2.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-zinc-200 border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                ย้อนกลับ
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {step < 5 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_12px_rgba(99,102,241,0.2)]"
              >
                {step === 1 ? "เริ่มทำแบบทดสอบ 📝" : "ถัดไป"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_12px_rgba(99,102,241,0.25)]"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    {mode === "profile" ? "บันทึกและเสร็จสิ้น" : "เสร็จสิ้นการตั้งค่า"}
                    <Check className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );

  if (mode === "page") {
    return cardContent;
  }

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {cardContent}
    </div>
  );
}
