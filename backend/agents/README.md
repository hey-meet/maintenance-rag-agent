# Agents Module

## Purpose

This module contains the core agent logic for the Maintenance RAG Assistant.

The agent will coordinate:

* User query processing
* Retrieval of relevant maintenance information
* Context management
* Response generation

## Planned Workflow

User Query
↓
Retriever
↓
Relevant Maintenance Context
↓
LLM Processing
↓
Final Response

## Current Files

### agent.py

Entry point for agent initialization.

## Future Work

* LangGraph workflow integration
* Agent state management
* Retrieval orchestration
* Response generation pipeline
