import React, { memo } from "react";
import "./PageHeader.css";
import { Navbar, Container, FormControl, ListGroup } from "react-bootstrap";

const PageHeader = (props) => {
  const {
    searchText,
    handleSearchInput,
    filteredOptions,
    onSelectingSuggestions,
  } = props;

  return (
    <Navbar expand="lg" bg="dark" variant="dark" fixed="top">
      <Container fluid>
        <Navbar.Brand>Search Photos</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll" className="searchBox">
          {/* search bar UI */}
          <FormControl
            type="input"
            placeholder="Search"
            className="me-2"
            aria-label="Search"
            style={{ width: "300px" }}
            value={searchText}
            onChange={handleSearchInput}
          />
          {/* display browser suggestions in a list */}
          <ListGroup className="autocompleteResults">
            {searchText.length > 0 &&
              filteredOptions.map((item) => {
                return (
                  <ListGroup.Item
                    key={item}
                    onClick={(item) => onSelectingSuggestions(item)}
                  >
                    {item}
                  </ListGroup.Item>
                );
              })}
          </ListGroup>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default memo(PageHeader);
