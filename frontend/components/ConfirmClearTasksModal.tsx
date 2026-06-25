"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";

interface ConfirmClearTasksModalProps {
  isOpen: boolean;
  clearing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmClearTasksModal({
  isOpen,
  clearing,
  onClose,
  onConfirm,
}: ConfirmClearTasksModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(9, 9, 11, 0.5)",
        backdropFilter: "blur(8px)",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderTop: "4px solid #f43f5e",
          borderRadius: 24,
          boxShadow:
            "0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.04), 0 0 40px rgba(244,63,94,0.08)",
          padding: "28px 24px",
          width: "100%",
          maxWidth: 380,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 0,
          color: "hsl(var(--foreground))",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(244,63,94,0.08)",
            border: "1px solid rgba(244,63,94,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Trash2 style={{ width: 24, height: 24, color: "#f43f5e" }} />
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "hsl(var(--foreground))",
            margin: "0 0 8px",
            letterSpacing: "-0.01em",
          }}
        >
          ล้างคลังงานทั้งหมด?
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: 12,
            color: "hsl(var(--muted-foreground))",
            margin: "0 0 6px",
            lineHeight: 1.6,
            padding: "0 8px",
          }}
        >
          คุณแน่ใจหรือไม่ว่าต้องการล้างงานทั้งหมดในคลังงานรวมถึงตารางเวลาที่เกี่ยวข้อง?
        </p>
        <p
          style={{
            fontSize: 11,
            color: "#f43f5e",
            fontWeight: 600,
            margin: "0 0 24px",
          }}
        >
          การกระทำนี้จะลบข้อมูลงานอย่างถาวรและไม่สามารถกู้คืนได้!
        </p>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: 12,
            width: "100%",
          }}
        >
          <button
            type="button"
            disabled={clearing}
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 600,
              border: "1px solid hsl(var(--border))",
              borderRadius: 12,
              background: "transparent",
              color: "hsl(var(--muted-foreground))",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            ยกเลิก
          </button>
          <button
            type="button"
            disabled={clearing}
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              borderRadius: 12,
              background: clearing ? "#9f1239" : "#f43f5e",
              color: "#fff",
              cursor: clearing ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              boxShadow: "0 4px 12px rgba(244,63,94,0.25)",
            }}
          >
            <Trash2 style={{ width: 14, height: 14 }} />
            {clearing ? "กำลังล้างข้อมูล..." : "ยืนยันล้างข้อมูล"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
