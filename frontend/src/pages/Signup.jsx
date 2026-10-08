import { Link } from "react-router-dom";

function Signup() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white">
      <div className="mx-auto flex min-h-[90vh] max-w-md items-center justify-center">
        <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl sm:p-8">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Create Account
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Create your account to discover and save movies.
            </p>
          </div>

          {/* Signup Form */}
          <form className="space-y-5">
            
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-zinc-200"
              >
                Name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your name"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-zinc-400"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-zinc-200"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-zinc-400"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-zinc-200"
              >
                Phone Number
              </label>

              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="+91XXXXXXXXXX"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-zinc-400"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-zinc-200"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="Create a password"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-zinc-400"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Create Account
            </button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-white underline underline-offset-4 hover:text-zinc-300"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Signup;