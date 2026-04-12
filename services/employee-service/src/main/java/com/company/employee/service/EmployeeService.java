package com.company.employee.service;

import com.company.employee.dto.ApiResponse;
import com.company.employee.dto.CreateEmployeeRequest;
import com.company.employee.model.Employee;
import com.company.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Transactional
    public Employee createEmployee(CreateEmployeeRequest request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Employee with email " + request.getEmail() + " already exists");
        }
        Employee employee = Employee.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .position(request.getPosition())
                .departmentId(request.getDepartmentId())
                .departmentName(request.getDepartmentName())
                .location(request.getLocation())
                .hireDate(request.getHireDate())
                .salary(request.getSalary())
                .status(Employee.Status.ACTIVE)
                .build();
        return employeeRepository.save(employee);
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
    }

    public List<Employee> getEmployeesByDepartment(Long departmentId) {
        return employeeRepository.findByDepartmentId(departmentId);
    }

    @Transactional
    public Employee updateEmployee(Long id, CreateEmployeeRequest request) {
        Employee employee = getEmployeeById(id);
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setPhone(request.getPhone());
        employee.setPosition(request.getPosition());
        employee.setDepartmentId(request.getDepartmentId());
        employee.setDepartmentName(request.getDepartmentName());
        employee.setLocation(request.getLocation());
        employee.setHireDate(request.getHireDate());
        employee.setSalary(request.getSalary());
        return employeeRepository.save(employee);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = getEmployeeById(id);
        employee.setStatus(Employee.Status.INACTIVE);
        employeeRepository.save(employee);
    }

    public long countActive() {
        return employeeRepository.findByStatus(Employee.Status.ACTIVE).size();
    }
}
