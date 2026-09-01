import Container from "../../../components/Container";
import Button from "../../../components/Button";

export default function FooterSection() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <Container>
        <div className="py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="space-y-4">
              <p className="text-2xl font-semibold text-white">TOTC</p>
              <p className="max-w-md text-sm leading-6 text-slate-400">
                Building the next generation of learners with modern courses,
                live mentorship, and career support.
              </p>

              <div className="mt-4">
                <p className="text-sm font-medium text-slate-300">
                  Join our newsletter
                </p>
                <form
                  className="mt-3 flex w-full max-w-sm flex-col items-stretch gap-3 sm:flex-row sm:items-center"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input
                    aria-label="Email"
                    placeholder="Enter your email"
                    className="min-w-0 w-full rounded-full bg-slate-900/60 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
                  />
                  <Button variant="primary" className="w-full sm:w-auto">
                    Subscribe
                  </Button>
                </form>
                <p className="mt-2 text-xs text-slate-500">
                  No spam — unsubscribe anytime.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm text-slate-400 lg:col-span-1">
              <div>
                <h4 className="mb-3 font-semibold text-slate-200">Company</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#about" className="transition hover:text-white">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#careers" className="transition hover:text-white">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#press" className="transition hover:text-white">
                      Press
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-slate-200">Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#courses" className="transition hover:text-white">
                      Courses
                    </a>
                  </li>
                  <li>
                    <a href="#blog" className="transition hover:text-white">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#contact" className="transition hover:text-white">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:flex lg:flex-col lg:items-end">
              <div>
                <h4 className="mb-3 font-semibold text-slate-200">Contact</h4>
                <p className="text-sm text-slate-400">hello@totc.example</p>
                <p className="mt-2 text-sm text-slate-400">+1 (555) 123-4567</p>
              </div>

              <div className="mt-6 flex gap-3">
                <Button variant="ghost">Privacy</Button>
                <Button variant="ghost">Terms</Button>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-800 pt-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-slate-500">
                © {new Date().getFullYear()} TOTC. All rights reserved.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <a href="#" className="transition hover:text-white">
                  Cookie Policy
                </a>
                <a href="#" className="transition hover:text-white">
                  Security
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
