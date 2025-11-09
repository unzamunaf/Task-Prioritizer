// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TaskPrioritizer {
    uint private taskCount = 0;
    
    struct Task {
        uint taskId;
        string description;
        uint priority; // 0=Low, 1=Medium, 2=High
        bool isCompleted;
    }
    
    mapping(uint => Task) private tasks;
    
    event TaskAdded(uint taskId, string description, uint priority);
    event TaskCompleted(uint taskId);
    
    function addTask(string memory _description, uint _priority) public {
        require(_priority <= 2, "Priority must be 0, 1, or 2");
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        taskCount++;
        tasks[taskCount] = Task(taskCount, _description, _priority, false);
        
        emit TaskAdded(taskCount, _description, _priority);
    }
    
    function markCompleted(uint _taskId) public {
        require(_taskId > 0 && _taskId <= taskCount, "Invalid task ID");
        require(!tasks[_taskId].isCompleted, "Task already completed");
        
        tasks[_taskId].isCompleted = true;
        emit TaskCompleted(_taskId);
    }
    
    function getAllTasks() public view returns (Task[] memory) {
        Task[] memory allTasks = new Task[](taskCount);
        
        for (uint i = 1; i <= taskCount; i++) {
            allTasks[i-1] = tasks[i];
        }
        
        return allTasks;
    }
    
    function getTaskCount() public view returns (uint) {
        return taskCount;
    }
    
    function getTask(uint _taskId) public view returns (Task memory) {
        require(_taskId > 0 && _taskId <= taskCount, "Invalid task ID");
        return tasks[_taskId];
    }
}