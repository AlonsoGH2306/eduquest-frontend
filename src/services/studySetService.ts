import { axiosInstance } from './axiosInstance';
import { StudySet, StudySetType } from '../types';

export const studySetService = {
  async getStudySet(documentId: number, type: StudySetType, refresh = false): Promise<StudySet> {
    const { data } = await axiosInstance.post<StudySet>(`/documents/${documentId}/study-set`, null, {
      params: { type, refresh },
      timeout: 90000,
    });
    return data;
  },
};
