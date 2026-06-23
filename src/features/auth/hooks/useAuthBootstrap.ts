import { useEffect, useState } from 'react';
import { runBootstrapOnce } from '@/features/auth/lib/run-bootstrap-once';

type BootStatus = 'pending' | 'done';

export function useAuthBootstrap(): BootStatus {
  const [status, setStatus] = useState<BootStatus>('pending');

  useEffect(() => {
    runBootstrapOnce().finally(() => setStatus('done'));
  }, []);

  return status;
}
