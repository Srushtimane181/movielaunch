import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useBookings } from "@/hooks/useBookings";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Users, Ticket } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-500",
  paid: "bg-green-500/20 text-green-500",
  cancelled: "bg-red-500/20 text-red-500",
  refunded: "bg-blue-500/20 text-blue-500",
};

const Bookings = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: bookings, isLoading } = useBookings();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">My Bookings</h1>
          <p className="mt-1 text-muted-foreground">View and manage your movie bookings</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="border-border bg-card">
                <CardContent className="flex gap-4 p-4">
                  <Skeleton className="h-32 w-24 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : bookings?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Ticket className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">No Bookings Yet</h2>
            <p className="mt-2 text-muted-foreground">
              You haven't booked any movies yet. Start exploring!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings?.map((booking) => (
              <Card key={booking.id} className="border-border bg-card">
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
                  <img
                    src={booking.movies.poster_url || "/placeholder.svg"}
                    alt={booking.movies.title}
                    className="h-32 w-24 rounded-lg object-cover"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-card-foreground">
                          {booking.movies.title}
                        </h3>
                        <Badge className={statusColors[booking.status]}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(booking.show_date), "EEE, MMM d, yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {booking.show_time}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {booking.seats} seat{booking.seats > 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Booked on {format(new Date(booking.created_at), "MMM d, yyyy")}
                      </span>
                      <span className="text-lg font-bold text-primary">
                        ₹{booking.total_price}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Bookings;
