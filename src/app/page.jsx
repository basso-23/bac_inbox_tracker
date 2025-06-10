import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import Dashboard from "@/components/sections/Dashboard";
import getMails from "@/lib/getMails";
import getCurrentMonth from "@/lib/getCurrentMonth";
import getMonthRange from "@/lib/getMonthRange";

export default async function Home() {
  const session = await getServerSession(authOptions);

  const defaultTarget = process.env.NEXT_PUBLIC_DEFAULT_TARGET;
  const defaultQty = process.env.NEXT_PUBLIC_DEFAULT_QTY;

  let currentMonth = getCurrentMonth();
  let rangeDate = getMonthRange(currentMonth);
  let mails = [];

  if (session) {
    mails = await getMails({
      accessToken: session.accessToken,
      target: defaultTarget,
      qty: defaultQty,
      startDate: rangeDate[0],
      endDate: rangeDate[1],
    });
  }

  return (
    <main className="font-general">
      <Dashboard
        session={session}
        mails={mails}
        currentMonth={currentMonth}
        currentRange={rangeDate}
      />
    </main>
  );
}
