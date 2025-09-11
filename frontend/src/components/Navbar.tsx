import { UserMenu } from "@/features/auth";

export const Navbar = () => {
  return (
    <div className="p-4 border-b flex items-center justify-between w-full">
      <div>
        <h1 className="text-xl font-bold">Unstruct</h1>
      </div>

      <UserMenu />
    </div>
  );
};
