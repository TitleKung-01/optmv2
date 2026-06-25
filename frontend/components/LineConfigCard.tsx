import React from "react";

interface LineConfigCardProps {
  lineUserId: string;
  onLineUserIdChange: (val: string) => void;
  onSave: () => void;
  isSaving: boolean;
  isSavedSuccess: boolean;
}

export default function LineConfigCard({
  lineUserId,
  onLineUserIdChange,
  onSave,
  isSaving,
  isSavedSuccess,
}: LineConfigCardProps) {
  return (
    <div className="sh-card p-6">
      <div className="text-sm font-bold text-emerald-500 mb-1 flex items-center gap-1.5">
        💬 LINE Notification
      </div>
      <div className="text-xs text-zinc-500 mb-5 font-medium">
        รับแจ้งเตือนงานผ่าน LINE เมื่องานจะเริ่มใน 5 นาที
      </div>

      <div className="mb-4">
        <label className="text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-1.5 block">
          LINE User ID
        </label>
        <input
          type="text"
          className="sh-input bg-zinc-900/40 border-zinc-800 text-zinc-100"
          placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          value={lineUserId}
          onChange={(e) => onLineUserIdChange(e.target.value)}
        />
        <div className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
          วิธีหา LINE User ID: ส่งข้อความใดก็ได้ไปที่บอทของเรา แล้วบอทจะตอบกลับ ID ให้ทันที
        </div>
      </div>

      {isSavedSuccess && (
        <div className="p-3 rounded-lg mb-4 bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
          ✓ บันทึก LINE User ID แล้ว
        </div>
      )}

      <button
        className="sh-btn sh-btn-default px-5 py-2.5 text-xs cursor-pointer"
        onClick={onSave}
        disabled={isSaving}
      >
        💬 บันทึก LINE User ID
      </button>
    </div>
  );
}
