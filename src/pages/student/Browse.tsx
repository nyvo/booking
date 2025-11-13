/**
 * Student browse page - shows all available classes, courses, and events
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin } from "lucide-react";
import StudentLayout from "@/components/layout/StudentLayout";
import { useClasses, useCourses, useEvents } from "@/hooks/useClasses";
import { formatDate, formatTime, formatCurrency } from "@/utils/date";
import { ROUTES } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ItemType = "all" | "single" | "course" | "event";

export default function Browse() {
  const navigate = useNavigate();
  const { data: classes, loading: loadingClasses } = useClasses();
  const { data: courses, loading: loadingCourses } = useCourses();
  const { data: events, loading: loadingEvents } = useEvents();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<ItemType>("all");
  const [sortBy, setSortBy] = useState<"date" | "price">("date");

  // Combine all items with type information
  const allItems = useMemo(() => {
    const items = [];

    if (classes?.data) {
      items.push(
        ...classes.data.map((c) => ({
          ...c,
          itemType: "single" as const,
          displayDate: c.date,
          availableSpots: c.capacity - c.bookedCount,
        })),
      );
    }

    if (courses?.data) {
      items.push(
        ...courses.data.map((c) => ({
          ...c,
          itemType: "course" as const,
          displayDate: c.startDate,
          availableSpots: c.capacity - c.enrolledCount,
        })),
      );
    }

    if (events?.data) {
      items.push(
        ...events.data.map((e) => ({
          ...e,
          itemType: "event" as const,
          displayDate: e.date,
          availableSpots: e.capacity - e.bookedCount,
        })),
      );
    }

    return items;
  }, [classes, courses, events]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = allItems;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((item) => item.itemType === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.description?.toLowerCase().includes(search) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(search)),
      );
    }

    // Sort
    if (sortBy === "date") {
      filtered.sort(
        (a, b) =>
          new Date(a.displayDate).getTime() - new Date(b.displayDate).getTime(),
      );
    } else {
      filtered.sort((a, b) => a.price - b.price);
    }

    return filtered;
  }, [allItems, filterType, searchTerm, sortBy]);

  const loading = loadingClasses || loadingCourses || loadingEvents;

  const handleItemClick = (item: (typeof filteredItems)[0]) => {
    if (item.itemType === "single") {
      navigate(ROUTES.STUDENT.CLASS_DETAIL.replace(":id", item.id));
    } else if (item.itemType === "course") {
      navigate(ROUTES.STUDENT.COURSE_DETAIL.replace(":id", item.id));
    } else {
      navigate(ROUTES.STUDENT.EVENT_DETAIL.replace(":id", item.id));
    }
  };

  const getTypeLabel = (type: string) => {
    if (type === "single") return "Enkeltkurs";
    if (type === "course") return "Kursrekke";
    return "Arrangement";
  };

  const getTypeBadgeColor = (type: string) => {
    if (type === "single") return "bg-blue-100 text-blue-800";
    if (type === "course") return "bg-purple-100 text-purple-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            Utforsk yogatimer
          </h1>
          <p className="mt-2 text-muted-foreground">
            Finn og book dine favoritt enkeltkurs, kursrekker og arrangement
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Search */}
          <Input
            placeholder="Søk etter navn, beskrivelse eller tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />

          {/* Type Filter */}
          <Select
            value={filterType}
            onValueChange={(v) => setFilterType(v as ItemType)}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Velg type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle typer</SelectItem>
              <SelectItem value="single">Enkeltkurs</SelectItem>
              <SelectItem value="course">Kursrekker</SelectItem>
              <SelectItem value="event">Arrangement</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as "date" | "price")}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sorter etter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Dato</SelectItem>
              <SelectItem value="price">Pris</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Viser {filteredItems.length} resultat
          {filteredItems.length !== 1 ? "er" : ""}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Laster...</p>
            </div>
          </div>
        )}

        {/* Items Grid */}
        {!loading && filteredItems.length === 0 && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">
                Ingen resultater funnet
              </p>
              <p className="mt-2 text-muted-foreground">
                Prøv å endre søkekriteriene dine
              </p>
            </div>
          </div>
        )}

        {!loading && filteredItems.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-20 md:pb-0">
            {filteredItems.map((item) => (
              <div
                key={`${item.itemType}-${item.id}`}
                className="rounded-lg border border-border bg-white p-6 transition-shadow hover:shadow-md cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                {/* Type Badge */}
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline">{getTypeLabel(item.itemType)}</Badge>
                  {item.availableSpots <= 3 && item.availableSpots > 0 && (
                    <Badge variant="secondary">Få plasser!</Badge>
                  )}
                  {item.availableSpots === 0 && (
                    <Badge variant="outline" className="text-muted-foreground">
                      Fullt
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  {item.name}
                </h3>

                {/* Details - Condensed */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                      {formatDate(new Date(item.displayDate))}
                    </div>
                    <span>•</span>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                      {item.itemType === "course"
                        ? item.recurringTime
                        : item.startTime}
                    </div>
                    <span>•</span>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      {item.location}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-foreground">
                      {item.availableSpots}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      ledige plasser
                    </span>
                  </div>
                </div>

                {/* Price and Button */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Pris</p>
                    <p className="text-xl font-semibold text-foreground">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item);
                    }}
                    disabled={item.availableSpots === 0}
                  >
                    {item.availableSpots === 0 ? "Fullt" : "Se detaljer"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
