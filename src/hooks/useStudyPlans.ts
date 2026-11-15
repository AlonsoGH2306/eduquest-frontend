import { useCallback, useState } from 'react';
import { studyPlanService } from '../services/studyPlanService';
import { StudyPlanRequest, StudyPlanResponse } from '../types';
import { useFetch } from './useFetch';

const newestFirst = (plans: StudyPlanResponse[]) =>
  [...plans].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export function useStudyPlans() {
  const fetchPlans = useCallback(
    (signal: AbortSignal) => studyPlanService.getMyPlans(signal).then(newestFirst),
    []
  );
  const { data, setData, loading, error, reload } = useFetch(fetchPlans);
  const [generating, setGenerating] = useState(false);

  const generatePlan = useCallback(
    async (payload: StudyPlanRequest) => {
      setGenerating(true);
      try {
        const created = await studyPlanService.generatePlan(payload);
        setData((previous) => [created, ...(previous ?? [])]);
        return created;
      } finally {
        setGenerating(false);
      }
    },
    [setData]
  );

  const replacePlan = useCallback(
    (updated: StudyPlanResponse) =>
      setData((previous) => (previous ?? []).map((plan) => (plan.id === updated.id ? updated : plan))),
    [setData]
  );

  const toggleStep = useCallback(
    async (plan: StudyPlanResponse, stepIndex: number) => {
      const current = new Set(plan.completedSteps);
      if (current.has(stepIndex)) current.delete(stepIndex);
      else current.add(stepIndex);
      const completedSteps = [...current].sort((a, b) => a - b);

      replacePlan({ ...plan, completedSteps });
      try {
        replacePlan(await studyPlanService.updateProgress(plan.id, completedSteps));
      } catch (error) {
        replacePlan(plan);
        throw error;
      }
    },
    [replacePlan]
  );

  return { plans: data ?? [], loading, error, reload, generating, generatePlan, toggleStep };
}
