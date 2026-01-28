export default function JobCardGetStared({ job }) {
  return (
    <div className="w-[250px] h-[200px] bg-gray-100 shadow-lg rounded-xl m-3 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col items-center justify-between p-4">

      {/* Job Type Badge */}
      <div className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-600">
        {job.type}
      </div>

      {/* Center Rounded Image Icon */}
      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center shadow-md">
        <img
          src={job.image}
          alt={job.name}
          className="w-16 h-16 rounded-full object-cover"
        />
      </div>

      {/* Job Name */}
      <h3 className="text-sm font-semibold text-gray-800 text-center">
        {job.name}
      </h3>

      {/* Button */}
      <button className="px-4 py-1.5 text-sm rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-300 cursor-pointer">
        Browse Job
      </button>
    </div>
  )
}
