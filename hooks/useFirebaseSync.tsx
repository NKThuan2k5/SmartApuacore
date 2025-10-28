import { db } from '@/constants/firebaseConfig';
import { DataSnapshot, off, onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

interface SystemData {
  water: {
    temp: number;
    ph: number;
    tds: number;
  };
}

interface SensorDataHook {
  data: SystemData | null;
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  lastUpdate: Date | null;
}

export const useSensorData = (): SensorDataHook => {
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Adjust RTDB path to match your structure: sensorData
    const sensorRef = ref(db, 'sensorData');

    const handleData = (snapshot: DataSnapshot) => {
      try {
        const raw = snapshot.val() as any;
        if (raw) {
          // Normalize to expected shape
          const normalized: SystemData = {
            water: {
              temp: Number(raw?.water?.temperature ?? raw?.water?.temp ?? 0),
              ph: Number(raw?.water?.ph ?? 0),
              tds: Number(raw?.water?.tds ?? 0),
            },
          };

          setData(normalized);
          setIsOnline(true);
          const ts = Number(raw?.ts);
          setLastUpdate(Number.isFinite(ts) && ts > 0 ? new Date(ts) : new Date());
          setError(null);
        } else {
          setError('No data available');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    const handleError = (err: Error) => {
      setError(err.message);
      setIsOnline(false);
      setLoading(false);
    };

    onValue(sensorRef, handleData, handleError);

    return () => {
      // Cleanup subscription
      off(sensorRef);
    };
  }, []);

  return { data, loading, error, isOnline, lastUpdate };
};