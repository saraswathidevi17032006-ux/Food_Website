import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/useAuth';

export const useRequireAuth = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (message = 'Please login or register to continue') => {
    if (isAuthenticated) return true;
    toast.info(message, { autoClose: 2500 });
    navigate('/login', { state: { from: `${location.pathname}${location.search}` } });
    return false;
  };
};
