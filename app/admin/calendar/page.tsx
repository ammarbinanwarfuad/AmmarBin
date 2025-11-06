"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, FileText, Edit } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { useBlogs } from '@/lib/hooks/useAdminData';
import Link from "next/link";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  published: boolean;
  publishedDate?: string;
  createdAt: string;
}

export default function AdminCalendarPage() {
  const { status } = useSession();
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  const { blogs: blogsData, isLoading } = useBlogs();
  const blogs: BlogPost[] = blogsData || [];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week for the month
  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array.from({ length: startDayOfWeek }, (_, i) => i);

  // Group blogs by date
  const blogsByDate: Record<string, BlogPost[]> = {};
  blogs.forEach((blog) => {
    const dateKey = blog.publishedDate
      ? format(new Date(blog.publishedDate), "yyyy-MM-dd")
      : format(new Date(blog.createdAt), "yyyy-MM-dd");
    
    if (!blogsByDate[dateKey]) {
      blogsByDate[dateKey] = [];
    }
    blogsByDate[dateKey].push(blog);
  });

  const getBlogsForDay = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd");
    return blogsByDate[dateKey] || [];
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Content Calendar</h1>
          <p className="text-muted-foreground mt-2">
            Plan and view your blog posts in a calendar view
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {format(currentMonth, "MMMM yyyy")}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center font-semibold text-sm text-muted-foreground">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month start */}
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Days of month */}
              {daysInMonth.map((day) => {
                const dayBlogs = getBlogsForDay(day);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString()}
                    className={`aspect-square border rounded-lg p-2 hover:bg-accent transition-colors ${
                      isToday ? "border-primary bg-primary/10" : ""
                    } ${!isSameMonth(day, currentMonth) ? "opacity-50" : ""}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayBlogs.slice(0, 3).map((blog) => {
                        const isScheduled = blog.publishedDate && new Date(blog.publishedDate) > new Date() && !blog.published;
                        return (
                          <Link
                            key={blog._id}
                            href={`/admin/blog`}
                            className={`block text-xs p-1 rounded truncate ${
                              isScheduled
                                ? "bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20"
                                : blog.published
                                ? "bg-primary/10 hover:bg-primary/20"
                                : "bg-yellow-500/10 hover:bg-yellow-500/20"
                            }`}
                            title={blog.title}
                          >
                            {isScheduled ? (
                              <CalendarIcon className="h-3 w-3 inline mr-1" />
                            ) : blog.published ? (
                              <FileText className="h-3 w-3 inline mr-1" />
                            ) : (
                              <Edit className="h-3 w-3 inline mr-1" />
                            )}
                            {blog.title}
                          </Link>
                        );
                      })}
                      {dayBlogs.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayBlogs.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span>Published</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-blue-500" />
                <span>Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-muted-foreground" />
                <span>Draft</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Posts */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Upcoming Posts</CardTitle>
            <CardDescription>Blog posts scheduled for this month</CardDescription>
          </CardHeader>
          <CardContent>
            {blogs.filter((blog) => {
              const blogDate = blog.publishedDate
                ? new Date(blog.publishedDate)
                : new Date(blog.createdAt);
              return isSameMonth(blogDate, currentMonth);
            }).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No posts scheduled for this month
              </p>
            ) : (
              <div className="space-y-2">
                {blogs
                  .filter((blog) => {
                    const blogDate = blog.publishedDate
                      ? new Date(blog.publishedDate)
                      : new Date(blog.createdAt);
                    return isSameMonth(blogDate, currentMonth);
                  })
                  .sort((a, b) => {
                    const dateA = a.publishedDate ? new Date(a.publishedDate) : new Date(a.createdAt);
                    const dateB = b.publishedDate ? new Date(b.publishedDate) : new Date(b.createdAt);
                    return dateA.getTime() - dateB.getTime();
                  })
                  .map((blog) => (
                    <div
                      key={blog._id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-muted-foreground w-24">
                          {format(
                            blog.publishedDate
                              ? new Date(blog.publishedDate)
                              : new Date(blog.createdAt),
                            "MMM dd"
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{blog.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {(() => {
                              const isScheduled = blog.publishedDate && new Date(blog.publishedDate) > new Date() && !blog.published;
                              if (isScheduled) {
                                return "Scheduled";
                              }
                              return blog.published ? "Published" : "Draft";
                            })()}
                          </div>
                        </div>
                      </div>
                      <Link href="/admin/blog">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

