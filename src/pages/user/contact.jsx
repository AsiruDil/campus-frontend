const Contact = () => {
  return (
    <div className="bg-white min-h-screen my-20">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT SIDE - CONTACT DETAILS */}
        <div className="space-y-4">

          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-md shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              University of Ruhuna – Main Campus
            </h3>
            <p className="text-sm text-slate-600">Wellamadama, Matara</p>
            <p className="text-sm text-slate-600">Sri Lanka</p>
            <p className="text-sm text-slate-600">(+94) 41-2033250</p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-md shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Faculty of Agriculture
            </h3>
            <p className="text-sm text-slate-600">Mapalana, Kamburupitiya</p>
            <p className="text-sm text-slate-600">(+94) 41-2292200</p>
            <p className="text-sm text-slate-600">(+94) 41-2292384</p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-md shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Faculty of Engineering
            </h3>
            <p className="text-sm text-slate-600">Hapugala, Galle</p>
            <p className="text-sm text-slate-600">(+94) 91-2245764</p>
            <p className="text-sm text-slate-600">dean@eng.ruh.ac.lk</p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-md shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Faculty of Medicine
            </h3>
            <p className="text-sm text-slate-600">PO Box 70, Galle</p>
            <p className="text-sm text-slate-600">(+94) 91-2234801</p>
            <p className="text-sm text-slate-600">deanmedruh@gmail.com</p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-md shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Faculty of Technology
            </h3>
            <p className="text-sm text-slate-600">
              Karagoda Uyangoda, Matara
            </p>
            <p className="text-sm text-slate-600">(+94) 41-2294751</p>
            <p className="text-sm text-slate-600">dean@tec.ruh.ac.lk</p>
          </div>

        </div>

        {/* RIGHT SIDE - GOOGLE MAP */}
        <div className="w-full h-[480px] rounded-lg overflow-hidden border border-blue-200 shadow-md">
          <iframe
            title="University of Ruhuna Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63492.68067008316!2d80.51866380674845!3d5.938318854084666!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae13904aaa02325%3A0x52467b7385d1d640!2sUniversity%20of%20Ruhuna!5e0!3m2!1sen!2slk!4v1706690000000!5m2!1sen!2slk"
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

      </div>
    </div>
  );
};

export default Contact;