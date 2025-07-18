import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/fetcher';

// Interface สำหรับข้อมูล Ride ที่จะได้รับจาก API
export interface RideCase {
  id: string;
  status: string;
  createdAt: string;
  driverId: string | null;
  patient: any; // อาจจะกำหนด Type ที่ละเอียดขึ้นในอนาคต
}

// Interface สำหรับ Response ทั้งหมดจาก API
interface ResponseData {
  success: boolean;
  cases: RideCase[];
}

export function useDriverCases() {
  const { token } = useAuth();

  // Key ของ SWR จะเป็น array ที่มีทั้ง URL และ Token
  // ถ้า token เป็น null, SWR จะไม่ทำการ fetch
  const key = token ? ['/api/driver/cases', token] : null;

  const { data, error, isLoading, mutate } = useSWR<ResponseData>(key, fetcher);

  // ถ้า data ยังไม่มี ให้ return array ว่างไปก่อนเพื่อป้องกัน error
  const cases = data?.cases ?? [];

  // ฟังก์ชันสำหรับรับงาน
  const acceptCase = async (rideId: string) => {
    if (!token) throw new Error('Not authenticated');

    const res = await fetch('/api/driver/cases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ rideId, action: 'accept' }),
    });

    if (!res.ok) {
      // สามารถจัดการ Error ที่นี่ได้ละเอียดขึ้น
      throw new Error(`Accept failed: ${res.status}`);
    }

    // สั่งให้ SWR โหลดข้อมูลใหม่เพื่ออัปเดต UI
    await mutate();
  };

  // ฟังก์ชันสำหรับจบงาน
  const completeCase = async (rideId: string) => {
    if (!token) throw new Error('Not authenticated');

    const res = await fetch('/api/driver/cases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ rideId, action: 'complete' }),
    });

    if (!res.ok) {
      throw new Error(`Complete failed: ${res.status}`);
    }

    // สั่งให้ SWR โหลดข้อมูลใหม่เพื่ออัปเดต UI
    await mutate();
  };

  return {
    cases,
    isLoading,
    isError: !!error, // แปลง error object เป็น boolean เพื่อง่ายต่อการใช้งาน
    error, // ส่ง error object กลับเพื่อ debug UI
    acceptCase,
    completeCase,
  };
}
