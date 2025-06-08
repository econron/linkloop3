"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PracticeCompletePage() {
  const router = useRouter();

  // 3秒後に自動リダイレクト（任意）
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     router.push("/");
  //   }, 3000);
  //   return () => clearTimeout(timer);
  // }, [router]);

  return (
    <div className="max-w-xl mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-6 text-green-600">練習完了！</h1>
      <p className="text-lg mb-8">お疲れさまでした！<br />全てのフレーズを練習しました。</p>
      <button
        onClick={() => router.push("/")}
        className="px-8 py-3 rounded-full font-medium bg-blue-500 hover:bg-blue-600 text-white text-lg"
      >
        ホームに戻る
      </button>
    </div>
  );
} 