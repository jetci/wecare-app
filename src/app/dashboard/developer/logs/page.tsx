"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export default function LogsPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/logs')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setLogs(data))
      .catch(() => setLogs(['ไม่สามารถโหลดบันทึกได้']))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">บันทึกและมอนิเตอร์ (Logs)</h2>
      {loading ? (
        <Spinner />
      ) : (
        <Card>
          <pre className="whitespace-pre-wrap text-sm">{logs.join('\n')}</pre>
        </Card>
      )}
    </div>
  );
}
