import { Link } from 'react-router-dom';
import { FiSend, FiClock, FiFolder, FiZap, FiCheck, FiUser, FiArrowRight } from 'react-icons/fi';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                  <img src='/logo.png' className=" w-12 h-12 rounded-lg"></img>
                <span className="ml-3 text-xl font-bold text-gray-900">ReqWiz</span>
              </div>
              <div className="hidden md:ml-10 md:flex space-x-8">
              </div>
            </div>
            <div className="flex items-center">
              <Link to="/main" className="ml-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Start Testing
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
          The Ultimate API Client for Developers
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10">
          Test, debug, and organize your APIs with ease. Save time with automated testing and collaborative features.
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            to="/main" 
            className="flex items-center px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Start Testing Your API <FiArrowRight className="ml-2" />
          </Link>
          <a 
            href="#features" 
            className="px-8 py-4 text-lg font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Learn More
          </a>
        </div>
      </div>

      {/* Feature Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="features">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">Powerful Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="bg-blue-100 p-3 rounded-lg inline-block mb-4">
              <FiSend className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">API Request Composer</h3>
            <p className="text-gray-600 mb-4">
              Craft HTTP requests with an intuitive interface. Support for all methods, headers, query parameters, and JSON body.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <FiCheck className="text-green-500 mr-2" /> Multiple HTTP methods
              </li>
              <li className="flex items-center">
                <FiCheck className="text-green-500 mr-2" /> Query parameter builder
              </li>
              <li className="flex items-center">
                <FiCheck className="text-green-500 mr-2" /> Header management
              </li>
            </ul>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="bg-green-100 p-3 rounded-lg inline-block mb-4">
              <FiClock className="text-green-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Request History</h3>
            <p className="text-gray-600 mb-4">
              Automatically save all your requests with timestamps and status codes for easy reference and replay.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <FiCheck className="text-green-500 mr-2" /> Timestamped history
              </li>
              <li className="flex items-center">
                <FiCheck className="text-green-500 mr-2" /> Quick replay
              </li>
              <li className="flex items-center">
                <FiCheck className="text-green-500 mr-2" /> Search and filter
              </li>
            </ul>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="bg-purple-100 p-3 rounded-lg inline-block mb-4">
              <FiFolder className="text-purple-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Collections</h3>
            <p className="text-gray-600 mb-4">
              Organize your API endpoints into collections for better project management and team collaboration.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <FiCheck className="text-green-500 mr-2" /> Group related requests
              </li>
              <li className="flex items-center">
                <FiCheck className="text-green-500 mr-2" /> Share with team
              </li>
              <li className="flex items-center">
                <FiCheck className="text-green-500 mr-2" /> Environment variables
              </li>
            </ul>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Feature 4 */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="bg-yellow-100 p-3 rounded-lg inline-block mb-4">
              <FiZap className="text-yellow-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Automated Testing</h3>
            <p className="text-gray-600 mb-4">
              Write tests for your APIs and run them automatically. Validate responses and ensure your APIs work as expected.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <FiCheck className="text-green-500 mr-2" /> Response validation
              </li>
              <li className="flex items-center">
                <FiCheck className="text-green-500 mr-2" /> Test suites
              </li>
              <li className="flex items-center">
                <FiCheck className="text-green-500 mr-2" /> Performance metrics
              </li>
            </ul>
          </div>
          
          {/* Feature 5 */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="bg-red-100 p-3 rounded-lg inline-block mb-4">
              <FiUser className="text-red-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Collaboration</h3>
            <p className="text-gray-600 mb-4">
              Work with your team by sharing collections and test results. Comment on requests and tests.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <FiCheck className="text-green-500 mr-2" /> Team workspaces
              </li>
              <li className="flex items-center">
                <FiCheck className="text-green-500 mr-2" /> Role-based access
              </li>
              <li className="flex items-center">
                <FiCheck className="text-green-500 mr-2" /> Activity feeds
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to see Wizard! ReqWiz</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join developers who use ReqWiz to build and test their APIs faster.
          </p>
          <Link 
            to="/main" 
            className="inline-block px-8 py-4 text-lg font-medium text-blue-600 bg-white rounded-lg hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
          >
            Start Testing Your API Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                  <img src='/logo.png' className=" w-12 h-12 rounded-lg"></img>
                <h3 className="ml-3 text-xl font-bold">ReqWiz</h3>
              </div>
              <p className="mt-4 text-gray-400">
                The ultimate API client for developers and teams.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} ReqWiz(by Abhinav). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;