
import { Link } from 'react-router-dom';
import JumpingHorse from '../icons/JumpingHorse';

export function NavigationLogo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <JumpingHorse className="h-6 w-6 text-primary" />
      <span className="font-bold text-xl">Alshaqab Quiz System</span>
    </Link>
  );
}
