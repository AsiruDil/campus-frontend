import ApplicationReview from '../../components/review/ApplicationReview';
import HeaderMadam from './headerMadam';

export default function AdminReviewPage() {
  return <div className="min-h-screen bg-slate-50"><HeaderMadam/><main className="max-w-7xl mx-auto px-4 sm:px-8 pt-28"><ApplicationReview/></main></div>;
}
