import useSWR from 'swr';

export interface SummaryData {
  totalDaily: number;
  totalWeekly: number;
  totalMonthly: number;
  avgResponseTime: number;
  satisfactionScore: number;
  monthlyTrends: { month: string; count: number }[];
  ratingTrends: { date: string; rating: number }[];
  rideTypeDistribution: { type: string; value: number }[];
}

export interface LeaderboardItem {
  id: string;
  name: string;
  count: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useExecutiveMetrics() {
  const { data: summary, error: summaryError } = useSWR<SummaryData>('/api/rides/summary', fetcher);
  const { data: leaderboard, error: leaderboardError } = useSWR<LeaderboardItem[]>('/api/reports/leaderboard', fetcher);

  const isLoading = !summary && !summaryError;
  const isError = Boolean(summaryError || leaderboardError);

  return { summary, leaderboard, isLoading, isError };
}
