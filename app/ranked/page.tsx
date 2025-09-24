import ComingSoonPage from '@/components/ComingSoonPage';

export default function RankedPage() {
  // Set target date to 20 days from now
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 20);

  return (
    <ComingSoonPage
      targetDate={targetDate}
      title="Coming Soon!"
      description="Our ranked mode is currently being built! Check back soon for competitive gameplay."
    />
  );
}