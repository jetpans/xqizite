export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="room layout flex flex-row justify-center w-full h-[93vh]">
      <section>{children}</section>
    </div>
  );
}
