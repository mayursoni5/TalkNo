import { useAppStore } from "@/store";

export default function Profile() {
  const { userInfo } = useAppStore();
  return (
    <div>
      profile
      <div>Email : {userInfo.email}</div>
    </div>
  );
}
