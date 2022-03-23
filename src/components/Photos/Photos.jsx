import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, Col, Row, Spinner } from "react-bootstrap";
import axios from "axios";
import "./Photos.css";
import ImageModal from "./ImageModal";
import { BASE_URL, API_KEY } from "../../constants";
import { debounce } from "../../helper";
import PageHeader from "./PageHeader/PageHeader";

const Photos = () => {
  const [showModal, setShowModal] = useState(false);
  const [imageClicked, setImageClicked] = useState({});
  const [pageNumber, setPageNumber] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [hasMore, setHasMore] = useState(false); //check if the api has more data to return
  const [filteredOptions, setFilteredOptions] = useState([]); //holds the suggestions based on searchtext
  const [options, setOptions] = useState([]); //holds all the localstorage items keys
  const [isError, setIsError] = useState(false);

  const observer = useRef(null);

  const loadImagesInitially = () => {
    setIsLoading(true);
    axios
      .get(
        `${BASE_URL}flickr.photos.getRecent&api_key=${API_KEY}&page=${pageNumber}&per_page=12&format=json&nojsoncallback=1`
      )
      .then((res) => {
        setImages((prev) => {
          return [...prev, ...res.data.photos.photo];
        });
        setHasMore(res.data.photos.total > 0);
      })
      .catch((err) => {
        setIsError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const triggerSearchApi = (text) => {
    if (text.length > 0) {
      setIsLoading(true);
      axios
        .get(
          `${BASE_URL}flickr.photos.search&api_key=${API_KEY}&text=${text}&page=${pageNumber}&per_page=12&format=json&nojsoncallback=1`
        )
        .then((res) => {
          if (res.data.photos.total === 0) setHasMore(false);
          else {
            setImages((prev) => {
              return [...prev, ...res.data.photos.photo];
            });
            setHasMore(true);

            //check if the input text is already present in the local storage
            //if yes then skip this
            //else store the text as key/value pair & concatenate the options array with new text
            if (!JSON.parse(localStorage.getItem(text.trim()))) {
              localStorage.setItem(text, JSON.stringify(text));
              setOptions((options) => [...options, text]);
            }
          }
        })
        .catch((err) => {
          setIsError(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  //use debounce function to add a delay of 500ms before calling the api
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optimisedSearch = useCallback(
    debounce((text) => {
      triggerSearchApi(text);
    }, 500),
    []
  );

  const handleSearchInput = (e) => {
    const inputValue = e.target.value;
    setSearchText(inputValue);
    setPageNumber(1);
    setImages([]);
    optimisedSearch(inputValue);

    //show suggestions only if the entered text length is more than 2
    //by filtering the options array and storing the value in filteredOptions array
    if (inputValue.length >= 3) {
      const filteredOptions = options.filter((item) => {
        return item.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
      });
      setFilteredOptions(filteredOptions);
    }
  };

  //increasing page number when the target node becomes visible in the viewport
  const lastImageRef = useCallback(
    (node) => {
      if (isLoading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPageNumber((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  //method to handle the selection of any suggestion from the list
  //and calling the api with that search key
  const onSelectingSuggestions = (item) => {
    setSearchText(item.target.outerText);
    setFilteredOptions([]);
    optimisedSearch(item.target.outerText);
  };

  //updating state to open the modal
  const handleImageClick = (img) => {
    setShowModal(true);
    setImageClicked(img);
  };

  const hideModal = () => setShowModal(false);

  //using callback to prevent the unnecessary render of ImageModal component
  const memoizedCallback = useCallback(() => hideModal(), []);

  useEffect(() => {
    if (searchText.length === 0) {
      loadImagesInitially();
    } else if (pageNumber >= 2) {
      //not calling this function directly when page number is 1
      //since it is already been called with debounce for the first time
      triggerSearchApi(searchText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, pageNumber]);

  useEffect(() => {
    //get all items from localstorage
    const items = { ...localStorage };
    setOptions(Object.keys(items));
  }, []);

  return (
    <>
      <PageHeader
        searchText={searchText}
        handleSearchInput={handleSearchInput}
        filteredOptions={filteredOptions}
        onSelectingSuggestions={onSelectingSuggestions}
      />

      <Row xs={1} md={3} lg={4} className="imagesRow">
        {images.map((img, idx) => {
          // add ref to the last element of the list
          if (images.length === idx + 1 && !isLoading) {
            return (
              <Col>
                <Card
                  onClick={() => handleImageClick(img)}
                  className="imageCards"
                  key={idx}
                >
                  <Card.Img
                    variant="top"
                    src={`https://live.staticflickr.com/${img.server}/${img.id}_${img.secret}.jpg`}
                    ref={lastImageRef}
                  />
                </Card>
              </Col>
            );
          } else {
            return (
              <Col>
                <Card
                  onClick={() => handleImageClick(img)}
                  className="imageCards"
                  key={idx}
                >
                  <Card.Img
                    variant="top"
                    src={`https://live.staticflickr.com/${img.server}/${img.id}_${img.secret}.jpg`}
                  />
                </Card>
              </Col>
            );
          }
        })}
      </Row>

      {/* display message after entering invalid text */}
      {searchText.length > 0 && !hasMore && (
        <div className="emptyList">
          No photos are present matching this query
        </div>
      )}

      {/* show loader till the api is not returing any response */}
      {isLoading && (
        <div>
          <Spinner animation="border" className="loaderStyles" />
        </div>
      )}

      {isError && (
        <div className="alignCenter">
          Something went wrong, please try again!
        </div>
      )}

      {/* Open modal on clicking any image */}
      <ImageModal img={imageClicked} show={showModal} hide={memoizedCallback} />
    </>
  );
};

export default Photos;
