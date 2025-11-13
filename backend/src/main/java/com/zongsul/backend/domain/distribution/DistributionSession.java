package com.zongsul.backend.domain.distribution;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DistributionSession 엔티티
 * - 남은 반찬을 선착순으로 배분하는 세션 표현
 * - 초기 capacity만큼 remainingCount를 채우고, 사용자가 Claim하면 1씩 감소
 *
 * 동시성 제어
 * - @Version 필드를 통해 낙관적 락 적용
 * - 동시에 여러 사용자가 같은 세션 차감 시 버전 충돌로 재시도 유도
 */
@Entity
@Table(name = "distribution_session")
@Getter
@Setter
@NoArgsConstructor
public class DistributionSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "menu_name", nullable = false)
    private String menuName;

    @Column(nullable = false)
    private Integer capacity;

    @Column(name = "remaining_count", nullable = false)
    private Integer remainingCount;

    @Column(nullable = false)
    private Boolean active;

    /**
     * 낙관적 락 버전 필드
     * - UPDATE 시 WHERE 절에 version을 포함해 경쟁 상황에서 안전한 차감을 보장
     */
    @Version
    private Integer version;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DistributionClaim> claims = new ArrayList<>();

    public DistributionSession(String menuName, Integer capacity) {
        this.menuName = menuName;
        this.capacity = capacity;
        this.remainingCount = capacity;
        this.active = true;
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
    }
}
