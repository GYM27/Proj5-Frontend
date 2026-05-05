import React from "react";
import { Pagination } from "react-bootstrap";

/**
 * Componente de Paginação Reutilizável.
 * @param {number} currentPage - Página atual (1-indexed).
 * @param {number} totalPages - Total de páginas.
 * @param {function} onPageChange - Callback para quando a página muda.
 */
const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    let items = [];
    for (let number = 1; number <= totalPages; number++) {
        items.push(
            <Pagination.Item 
                key={number} 
                active={number === currentPage}
                onClick={() => onPageChange(number)}
                className="mx-1"
            >
                {number}
            </Pagination.Item>
        );
    }

    return (
        <div className="d-flex justify-content-center mt-4 mb-5">
            <Pagination className="pagination-custom shadow-sm rounded">
                <Pagination.Prev 
                    disabled={currentPage === 1} 
                    onClick={() => onPageChange(currentPage - 1)} 
                />
                {items}
                <Pagination.Next 
                    disabled={currentPage === totalPages} 
                    onClick={() => onPageChange(currentPage + 1)} 
                />
            </Pagination>
        </div>
    );
};

export default PaginationComponent;
