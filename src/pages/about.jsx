
import campusImg from "../assets/campus.png";

const AboutPage = () => {
  const aboutDetails = {
    title: "University of Ruhuna",
    heroImage: campusImg,
    history: `The University of Ruhuna (UOR) was established by a Special Presidential Decree on 1st September 1978 as Ruhuna University College. It was elevated to a fully-fledged national university on 1st February 1984.

Located in the scenic Southern province, the main campus at Wellamadama, Matara was designed by the world-renowned architect Geoffrey Bawa. It stands as the intellectual heartbeat of the South, currently serving thousands of students across ten faculties.`,
    vision: "To be the prime intellectual thrust of the nation.",
    mission:
      "To advance knowledge and skills through teaching, research, and services to serve the society.",
  };

  const faculties = [
    { name: "Faculty of Agriculture", link: "https://www.agri.ruh.ac.lk/" },
    { name: "Faculty of Allied Health Sciences", link: "https://www.ahs.ruh.ac.lk/" },
    { name: "Faculty of Engineering", link: "https://www.eng.ruh.ac.lk/" },
    { name: "Faculty of Fisheries and Marine Sciences", link: "https://www.fmst.ruh.ac.lk/" },
    { name: "Faculty of Graduate Studies", link: "https://fgs.ruh.ac.lk/" },
    { name: "Faculty of Humanities & Social Sciences", link: "https://www.hss.ruh.ac.lk/" },
    { name: "Faculty of Management & Finance", link: "https://www.mgt.ruh.ac.lk/" },
    { name: "Faculty of Medicine", link: "https://www.medi.ruh.ac.lk/" },
    { name: "Faculty of Science", link: "https://www.sci.ruh.ac.lk/" },
    { name: "Faculty of Technology", link: "https://www.tec.ruh.ac.lk/" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 my-20">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

        {/* LEFT SIDE — ABOUT CONTENT */}
        <div className="flex-1">

          {/* PAGE TITLE */}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8">
            About The University
          </h2>

          {/* HERO IMAGE */}
          <div className="relative w-full h-64 sm:h-80 md:h-96 mb-10 rounded-3xl overflow-hidden shadow-xl group">
            <img
              src={aboutDetails.heroImage}
              alt="University of Ruhuna"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end">
              <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold p-6 sm:p-8 drop-shadow-lg">
                {aboutDetails.title}
              </h1>
            </div>
          </div>

          {/* HISTORY */}
          <div className="space-y-6 text-base sm:text-lg text-gray-600 leading-relaxed">
            {aboutDetails.history.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* VISION & MISSION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">

            {/* VISION */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Our Vision
              </h3>
              <p className="text-gray-600 italic">
                "{aboutDetails.vision}"
              </p>
            </div>

            {/* MISSION */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Our Mission
              </h3>
              <p className="text-gray-600 italic">
                "{aboutDetails.mission}"
              </p>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE — SIDEBAR */}
        <aside className="w-full lg:w-1/4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 px-2">
              Our Faculties
            </h3>

            <div className="flex flex-col space-y-1">
              {faculties.map((f) => (
                <a
                  key={f.name}
                  href={f.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  <span>{f.name}</span>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default AboutPage;