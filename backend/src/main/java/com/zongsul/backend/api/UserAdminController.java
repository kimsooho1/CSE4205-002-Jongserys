package com.zongsul.backend.api;

import com.zongsul.backend.domain.user.User;
import com.zongsul.backend.domain.user.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 사용자 목록 조회 엔드포인트
 * - 목적: 프론트엔드 관리 화면에서 전체 사용자 목록을 표 형태로 표시
 * - 권한: 관리자만 접근 가능 (JWT 토큰에 ROLE_ADMIN 필요, @PreAuthorize로 강제)
 * - 데이터 소스: JPA UserRepository로 DB users 테이블 조회, 필요한 필드만 DTO로 매핑
 * - 트래픽: 목록 확대 대비 페이징 확장 가능 (향후 Pageable 인자 추가)
 */
@RestController
@RequestMapping("/api")
public class UserAdminController {

    private final UserRepository userRepository;

    public UserAdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 사용자 전체 목록 반환
     * - 현재: 단순 전체 조회 후 id, userId, name, role, createdAt만 반환
     * - 프론트 리스트 렌더링용 가벼운 DTO 사용
     * - 보안: 비밀번호 등 민감 정보 미포함
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserSummary> listUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(u -> new UserSummary(u.getId(), u.getUserId(), u.getName(), u.getRole().name(), u.getCreatedAt()))
                .toList();
    }

    /**
     * 사용자 목록 응답 전용 DTO
     * - 엔티티 전체 노출 방지, 필요한 최소 필드만 포함
     * - createdAt: 테이블 정렬이나 표시용으로 활용
     */
    public record UserSummary(
            Long id,
            String userId,
            String name,
            String role,
            LocalDateTime createdAt
    ) {}
}
