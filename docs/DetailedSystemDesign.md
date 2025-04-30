# MovieWhiz: Detailed System Design

### Note

- Diagrams and images should be placed inside `/docs/uml/`.

## Group Details

- **Team Members:**
  - Ayush Patel
  - Gary Qin
  - Sarah Lum
  - Musbuddin Mondal
  - Michael Padeigis

---

# 1. Introduction

## 1.1 Purpose

This document provides an in-depth look into the architecture of the MovieWhiz application, including diagrams illustrating the flow of information and the relationships between different components.

This document is intended for internal MovieWhiz stakeholders, including project managers, developers, and team members.

MovieWhiz Requirements and Architecture documents should be read prior, and technical knowledge in the software field is useful for a deeper understanding of this document.

## 1.2 System Description

An overview of the system description can be found in Architecture.md. This document acts as an extension of Architecture.md, providing more context in form of state diagrams for each controller, sequence diagrams for each use case, and a detailed class diagram.

## 1.3 Overview

This document describes the different diagrams related to MovieWhiz. Section 2 contains the relevant state chart diagrams. Section 3 describes the sequence diagrams. Section 4 provides the detailed class diagram of the system.

# 2. State Charts for Controller Classes

### 2.1 Account Management Controller State Diagram

![Account Manager State Diagram](./uml/account_manager_state_diagram.png)

### 2.2 Movie Identification Controller State Diagram

![Movie ID State Diagram](./uml/movie_id_state_diagram.png)

### 2.3 Movie Information Controller State Diagram

![Movie Info State Diagram](./uml/movie_info_state_diagram.png)

# 3. Sequence Diagrams

### 3.1 Create Account Sequence Diagram

![Create Account Sequence Diagram](./uml/sequence_diagrams/create_account.png)

### 3.2 Edit Account Sequence Diagram

![Edit Account Sequence Diagram](./uml/sequence_diagrams/edit_account.png)

### 3.3 Login Sequence Diagram

![Login Sequence Diagram](./uml/sequence_diagrams/login.png)

### 3.4 Upload Soundtrack Sequence Diagram

![Upload Sountrack Sequence Diagram](./uml/sequence_diagrams/upload_soundtrack.png)

### 3.5 Textual Description Sequence Diagram

![Textual Description Sequence Diagram](./uml/sequence_diagrams/textual_description.png)

### 3.6 Form Input Sequence Diagram

![Form Input Sequence Diagram](./uml/sequence_diagrams/form_input.png)

### 3.7 Response History Sequence Diagram

![Response History Sequence Diagram](./uml/sequence_diagrams/response_history.png)

# 4. Class Diagrams

### 4.1 Detailed Class Diagram

![Detailed Class Diagram](./uml/detailed_class_diagram.svg)

### 4.2 Blackboard Class Diagram

The figure below represents a zoomed in look at the blackboard architecture part of the class diagram:

![Blackboard Class Diagram](./uml/blackboard_class_diagram.svg)

As part of the blackboard architecture, this class diagram includes a blackboard, and a blackboard controller, which orchestrates the movie identification process and determines the final answer.

Here we also see the subscribe notify pattern being used. All classes that extend the MovieExpertObserver class subscribe to the blackboard which notifies them when new inputs are added by the user. This design makes it very easy to add in a new expert by simply extending the abstract class.
