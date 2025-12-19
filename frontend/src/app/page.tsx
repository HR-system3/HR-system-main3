import Image from "next/image";
import RecruitmentLayout from "./recruitment/layout";
import RecruitmentPage from "./recruitment/page";

export default function Home() {
  return (
      <RecruitmentLayout>
        <RecruitmentPage />
      </RecruitmentLayout>
  );
}
