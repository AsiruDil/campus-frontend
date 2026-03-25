
import { FiX, FiUser, FiMail, FiCalendar, FiTarget, FiHash } from 'react-icons/fi';

const UserDetailsModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-primary p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img 
              src={user.img} 
              alt={user.userName} 
              className="w-16 h-16 rounded-full border-2 border-white/50 object-cover"
            />
            <div>
              <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
              <p className="text-blue-100 text-sm">@{user.userName}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <DetailRow icon={<FiMail />} label="Email" value={user.email} />
          <DetailRow icon={<FiTarget />} label="Role" value={user.role} isBadge />
          <DetailRow icon={<FiHash />} label="User ID" value={user.id || 'N/A'} />
          <DetailRow icon={<FiUser />} label="Gender" value={user.gender || 'Not Specified'} />
          <DetailRow icon={<FiCalendar />} label="Birthday" value={user.birthday || 'Not Specified'} />
          <DetailRow icon={<FiCalendar />} label="Joined Date" value={new Date(user.date).toLocaleDateString()} />
          
          <div className="flex items-center gap-3 pt-2">
             <span className={`w-3 h-3 rounded-full ${user.isBlocked ? 'bg-red-500' : 'bg-green-500'}`}></span>
             <span className="text-sm font-medium text-textGray">
                Account Status: {user.isBlocked ? 'Blocked' : 'Active'}
             </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t text-center">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-textDark font-bold rounded-lg transition-all"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};


const DetailRow = ({ icon, label, value, isBadge }) => (
  <div className="flex items-start gap-3 border-b border-gray-100 pb-2">
    <div className="text-primary mt-1">{icon}</div>
    <div>
      <p className="text-[10px] uppercase font-bold text-textGray tracking-wider">{label}</p>
      {isBadge ? (
        <span className="inline-block px-3 py-0.5 rounded-full bg-blue-50 text-primary text-xs font-bold mt-1 capitalize">
          {value}
        </span>
      ) : (
        <p className="text-textDark font-medium">{value}</p>
      )}
    </div>
  </div>
);

export default UserDetailsModal;