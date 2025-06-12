import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import Dashboard from "@/components/sections/Dashboard";
import getMails from "@/lib/getMails";

import {
  getCurrentMonth,
  getCurrentStartDay,
  getCurrentFinalDay,
  getCurrentYear,
} from "@/lib/getCurrentDate";

import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // ⛔ Si no hay sesión, redirige al login
  if (!session) {
    redirect("/api/auth/signin");
  }

  const defaultTarget = process.env.NEXT_PUBLIC_DEFAULT_TARGET;
  const defaultQty = process.env.NEXT_PUBLIC_DEFAULT_QTY;

  let currentMonth = getCurrentMonth();
  let currentStartDay = getCurrentStartDay();
  let currentFinalDay = getCurrentFinalDay();
  let currentYear = getCurrentYear();
  let proxyImg = `/api/proxy/profile-img?url=${encodeURIComponent(
    session.user.image
  )}`;

  let mails = [];

  if (session) {
    mails = await getMails({
      accessToken: session.accessToken,
      target: defaultTarget,
      qty: defaultQty,
      startDate: currentYear + "-" + currentMonth + "-" + currentStartDay,
      endDate: currentYear + "-" + currentMonth + "-" + currentFinalDay,
    });
  }

  return (
    <main className="font-general">
      <Dashboard
        session={session}
        mails={mails}
        currentMonth={currentMonth}
        currentStartDay={currentStartDay}
        currentFinalDay={currentFinalDay}
        currentYear={currentYear}
        profileImg={proxyImg}
      />
    </main>
  );
}
