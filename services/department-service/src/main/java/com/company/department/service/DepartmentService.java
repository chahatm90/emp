package com.company.department.service;

import com.company.department.dto.CreateDepartmentRequest;
import com.company.department.model.Department;
import com.company.department.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Transactional
    public Department createDepartment(CreateDepartmentRequest request) {
        if (departmentRepository.existsByName(request.getName())) {
            throw new RuntimeException("Department " + request.getName() + " already exists");
        }
        Department department = Department.builder()
                .name(request.getName())
                .description(request.getDescription())
                .location(request.getLocation())
                .manager(request.getManager())
                .build();
        return departmentRepository.save(department);
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
    }

    @Transactional
    public Department updateDepartment(Long id, CreateDepartmentRequest request) {
        Department department = getDepartmentById(id);
        department.setName(request.getName());
        department.setDescription(request.getDescription());
        department.setLocation(request.getLocation());
        department.setManager(request.getManager());
        return departmentRepository.save(department);
    }

    @Transactional
    public void updateEmployeeCount(Long id, int count) {
        Department department = getDepartmentById(id);
        department.setEmployeeCount(count);
        departmentRepository.save(department);
    }
}
