"use client";

import { useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Spinner } from '@/components/ui/Spinner';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<string>("areas");
  const [confirm, setConfirm] = useState<{ action: string; id?: string } | null>(null);

  const { data: areas, error: areasError, isLoading: areasLoading, mutate: reloadAreas } = useSWR<Area[]>('/api/admin/areas', fetcher);
  const { data: caseTypes, error: caseTypesError, isLoading: caseTypesLoading, mutate: reloadCaseTypes } = useSWR<CaseType[]>('/api/admin/case-types', fetcher);
  const { data: templates, error: templatesError, isLoading: templatesLoading, mutate: reloadTemplates } = useSWR<any[]>('/api/admin/notifications/templates', fetcher);
  const { data: thresholds, error: thresholdsError, isLoading: thresholdsLoading, mutate: reloadThresholds } = useSWR<any>('/api/admin/thresholds', fetcher);
  const { data: apiKeys, error: apiKeysError, isLoading: apiKeysLoading, mutate: reloadKeys } = useSWR<any[]>('/api/admin/api-keys', fetcher);

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      await fetch(confirm.action + (confirm.id ? `/${confirm.id}` : ''), { method: 'DELETE' });
      toast.success('ลบสำเร็จ');
      setConfirm(null);
      // reload
      if(tab==='areas') reloadAreas();
      if(tab==='api-keys') reloadKeys();
    } catch {
      toast.error('ลบไม่สำเร็จ');
    }
  };

  const runBackup = async () => {
    try {
      await fetch('/api/admin/backup', { method: 'POST' });
      toast.success('Backup เรียบร้อย');
    } catch {
      toast.error('Backup ล้มเหลว');
    }
  };

  return (
    <div className="p-4">
      {/* Global loading/error */}
      {(areasLoading || caseTypesLoading || templatesLoading || thresholdsLoading || apiKeysLoading) && <Spinner />}
      {(areasError || caseTypesError || templatesError || thresholdsError || apiKeysError) && <p className="text-red-500">Error loading settings</p>}
      <div className="flex flex-wrap gap-2 border-b mb-4">
        {['areas','case-types','templates','thresholds','api-keys','maintenance'].map(t => (
          <button key={t} onClick={()=>setTab(t)}
            className={`${tab===t?'border-b-2 border-blue-600':''} pb-2 px-4`}>
            {t==='areas'? 'Service Areas'
              :t==='case-types'? 'Case Types'
              :t==='templates'? 'Message Templates'
              :t==='thresholds'? 'Thresholds'
              :t==='api-keys'? 'API Keys'
              :'Maintenance'}
          </button>
        ))}
      </div>

      {/* Service Areas */}
      {tab==='areas' && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Service Area Configuration</h2>
          <table className="w-full mb-4">
            <thead><tr><th>Province</th><th>District</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {areas?.map(a => (
                <tr key={a.id} className="border-t">
                  <td>{a.province}</td><td>{a.district}</td>
                  <td>{a.active?'Active':'Inactive'}</td>
                  <td>
                    <button onClick={()=>{}} className="text-blue-500 mr-2">Edit</button>
                    <button onClick={()=>setConfirm({action:'/api/admin/areas',id:a.id})} className="text-red-500">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={()=>{}} className="bg-green-600 text-white px-4 py-2 rounded">Add Area</button>
        </div>
      )}

      {/* Case Types */}
      {tab==='case-types' && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Case Type & Status</h2>
          <ul>
            {caseTypes?.map(ct => (
              <li key={ct.id} className="flex justify-between border-t py-2">
                {ct.name}
                <button onClick={()=>{}} className="text-blue-500">Edit Flow</button>
              </li>
            ))}
          </ul>
          <button onClick={()=>{}} className="mt-4 bg-green-600 text-white px-4 py-2 rounded">Add Case Type</button>
        </div>
      )}

      {/* Message Templates */}
      {tab==='templates' && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Notification Message Templates</h2>
          {templates?.map(tpl => (
            <div key={tpl.id} className="mb-4">
              <label className="block mb-1">{tpl.key}</label>
              <textarea defaultValue={String(tpl.message)} className="w-full border rounded p-2" />
            </div>
          ))}
          <button onClick={()=> toast.success('Saved')} className="bg-blue-600 text-white px-4 py-2 rounded">Save Templates</button>
        </div>
      )}

      {/* Thresholds */}
      {tab==='thresholds' && (
        <div>
          <h2 className="text-lg font-semibold mb-2">System Thresholds</h2>
          {thresholds && Object.entries(thresholds).map(([key,val]) => (
            <div key={key} className="mb-4">
              <label className="block mb-1">{key}</label>
              <input type="number" defaultValue={String(val)} className="border rounded p-2 w-32" />
            </div>
          ))}
          <button onClick={()=> toast.success('Saved')} className="bg-blue-600 text-white px-4 py-2 rounded">Save Thresholds</button>
        </div>
      )}

      {/* API Keys */}
      {tab==='api-keys' && (
        <div>
          <h2 className="text-lg font-semibold mb-2">API Key Management</h2>
          <ul>
            {apiKeys?.map(key => (
              <li key={key.id} className="flex justify-between border-t py-2">
                {key.key}
                <button onClick={()=>setConfirm({action:'/api/admin/api-keys',id:key.id})} className="text-red-500">Revoke</button>
              </li>
            ))}
          </ul>
          <button onClick={()=>toast.success('Generated')} className="mt-4 bg-green-600 text-white px-4 py-2 rounded">Generate Key</button>
        </div>
      )}

      {/* Maintenance */}
      {tab==='maintenance' && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Backup & Maintenance</h2>
          <button onClick={runBackup} className="bg-blue-600 text-white px-4 py-2 rounded mb-2">Manual Backup</button>
          <div className="mb-2">
            <label className="mr-2">Auto Backup (days):</label>
            <input type="number" className="border rounded p-1 w-16" />
          </div>
          <button onClick={()=>toast.success('Cache Cleared')} className="bg-gray-600 text-white px-4 py-2 rounded mb-2">Clear Cache</button>
          <div>
            <label className="block mb-1">Restore from File</label>
            <input type="file" accept=".json,.csv" className="border p-1" />
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmationModal
          open={!!confirm}
          title="Confirm Delete"
          message="คุณแน่ใจหรือไม่?"
          onConfirm={handleDelete}
          onCancel={()=>setConfirm(null)}
        />
      )}
    </div>
  );
}

// Types
interface Area { id: string; province: string; district: string; active: boolean; }
interface CaseType { id: string; name: string; }
