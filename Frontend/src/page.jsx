import './page.css'

const Page = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <nav className="pagination" aria-label="Hotel pages">
      <button
        type="button"
        aria-label="Previous page"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ‹
      </button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
        <button
          type="button"
          className={currentPage === page ? 'active' : ''}
          aria-current={currentPage === page ? 'page' : undefined}
          key={page}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        aria-label="Next page"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        ›
      </button>
    </nav>
  )
}

export default Page
