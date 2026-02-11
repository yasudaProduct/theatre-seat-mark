import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { ReviewCard } from '../components/ReviewCard'

describe('Page', () => {
  it('renders ReviewCard component', () => {
    render(<ReviewCard />);
    const reviewCardElement = screen.getByTestId('review-card');
    expect(reviewCardElement).toBeInTheDocument();
  });

  it('displays correct props', () => {

    const review = {
        id: 1,
        user: { name: "yuta" },
        seatNumber: "D15",
        rating: 1,
        review: "good",
        isBookmarked: false,
    }

    render(<ReviewCard review={review} />)

    const reviewCardElement = screen.getByTestId('review-card')
    expect(reviewCardElement).toBeInTheDocument()

    expect(screen.getByText('yuta')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('D15'))).toBeInTheDocument();
    expect(screen.getByText('good')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const review = {
      id: 1,
      user: { name: "yuta" },
      seatNumber: "D15",
      rating: 1,
      review: "good",
      isBookmarked: false,
  }
    const { asFragment } = render(<ReviewCard review={review} />);
    expect(asFragment()).toMatchSnapshot();
  });
})