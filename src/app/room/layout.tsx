export default function RoomLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="room">
      <div>Room layout</div>
      <section>{children}</section>
    </div>
  );
}