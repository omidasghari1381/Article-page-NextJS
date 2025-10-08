import LoginFormClient from "@/components/auth/LoginFormClient";
import AutoSlider from "@/components/AutoSlider";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-[28px] shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative bg-[#FAFAFA]">
              <div className="relative bg-gray-50">
                <div className="p-8 sm:p-12 lg:p-16 h-full">
                  <AutoSlider />
                </div>
              </div>
            </div>

            <LoginFormClient />
          </div>
        </div>
      </div>
    </div>
  );
}