
import ComingSoonPage from '@/components/ComingSoonPage';

export default function LorePage() {
	// Set target date to 20 days from now
	const targetDate = new Date();
	targetDate.setDate(targetDate.getDate() + 20);

	return (
		<ComingSoonPage
			targetDate={targetDate}
			title="Coming Soon!"
			description="The Waterloo Guesser lore page is under construction. Check back soon for fun facts, history, and get to know more Greg!"
		/>
	);
}
