package com.ist.lms.repository;

import com.ist.lms.model.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, Long> {
    Optional<Holiday> findByDate(LocalDate date);
    
    @Query("SELECT h FROM Holiday h WHERE MONTH(h.date) = :month AND YEAR(h.date) = :year")
    List<Holiday> findByMonthAndYear(@Param("month") int month, @Param("year") int year);
    
    @Query("SELECT h FROM Holiday h WHERE h.date BETWEEN :startDate AND :endDate")
    List<Holiday> findHolidaysInDateRange(@Param("startDate") LocalDate startDate, 
                                         @Param("endDate") LocalDate endDate);
    
    @Query("SELECT h FROM Holiday h WHERE (MONTH(h.date) = :month AND DAY(h.date) = :day) AND h.isRecurring = true")
    List<Holiday> findRecurringHolidayByMonthAndDay(@Param("month") int month, @Param("day") int day);
} 