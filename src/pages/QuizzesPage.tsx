
import Navigation from '@/components/Navigation';
import QuizzesList from '@/components/QuizzesList';

export default function QuizzesPage() {
  return (
    <div>
      <Navigation />
      
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="my-8">
          <h1 className="text-3xl font-bold mb-8">Explore All Quizzes</h1>
          <QuizzesList />
        </div>
      </div>
    </div>
  );
}
