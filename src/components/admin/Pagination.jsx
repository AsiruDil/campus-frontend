
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange, showingStart, showingEnd }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Logic to generate the array of page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-between text-textGray text-sm">
      {/* Dynamic text based on current filtered results */}
      <div>
        {totalItems > 0 ? (
          <>
            Showing <span className="font-bold text-textDark">{showingStart}</span> to{' '}
            <span className="font-bold text-textDark">{showingEnd}</span> of{' '}
            <span className="font-bold text-textDark">{totalItems}</span> users
          </>
        ) : (
          "No users found matching the filters"
        )}
      </div>

      {/* Navigation Controls: Only show if there is more than 1 page */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {/* Previous Page Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white transition-colors"
          >
            <FiChevronLeft size={18} />
          </button>

          {/* Page Number Buttons */}
          <div className="flex gap-1">
            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => onPageChange(number)}
                className={`w-8 h-8 flex items-center justify-center rounded-md font-bold transition-all ${
                  currentPage === number
                    ? 'bg-primary text-white shadow-md'
                    : 'border bg-white text-textGray hover:bg-gray-50'
                }`}
              >
                {number}
              </button>
            ))}
          </div>

          {/* Next Page Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white transition-colors"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;