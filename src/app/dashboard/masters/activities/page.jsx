"use client";

import { Suspense } from 'react';
import ActivitiesManager from '../../../../components/activities/ActivitiesManager';
import { LoadingSpinner } from '../../../../components/ui/Loading';

export default function ActivitiesPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Suspense fallback={<LoadingSpinner size="lg" text="Loading activities..." />}>
        <ActivitiesManager />
      </Suspense>
    </div>
  );
}
