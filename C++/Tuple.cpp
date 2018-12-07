#include <iostream>
#include <vector>
using namespace std;

/**
 * An implementation of std::tuple
*/
template <typename ... Args>
class Tuple {
public:
    Tuple(Args ... args) : size{sizeof...(args)} {
        typeArr = new Base*[size]{ new Wrapper<Args>(args)... };
    }
    
    ~Tuple() {
        for (int i = 0; i < size; ++i)
            delete typeArr[i];
        delete [] typeArr;
    }

    /**
     * returns Nth stored object as its type
    */
    template <size_t N>
    auto getItem() {
        return static_cast<Wrapper<typename GetType<N, TypeList<Args...>>::result>&>(*(typeArr[N])).content;;
    }

private:
    /**
     * Base class for object storage
    */
    struct Base {};

    /**
     * Wrapper stores the values as base inside typeArr
    */
    template <typename T>
    struct Wrapper : Base {
        Wrapper(const T & t) : content{t} { }
        
        T content;
    };

    /**
     * A type container used to determine Nth type of Args...
    */
    template <typename ... TypeArgs>
    struct TypeList;

    template <typename First, typename ... Rest>
    struct TypeList<First, Rest...> {
        typedef First Head;
        typedef TypeList<Rest...> Tail;
    };

    template <typename First>
    struct TypeList<First> {
        typedef First Head;
        typedef void Tail;
    };

    /**
     * Use recursion to get Nth type of Args...
     * index is the type's location in the target list.
    */
    template <size_t index, typename Container>
    struct GetType {
        typedef typename GetType<index - 1, typename Container::Tail>::result result;
    };

    template <typename Container>
    struct GetType<0, Container> {
        typedef typename Container::Head result;
    };
    
    int size;
    Base ** typeArr;
};

template <typename ... Args>
Tuple<Args...> makeTuple(Args ... args) {
    return Tuple<Args...>{ args... };
}

int main() { // testing
    auto tup = makeTuple(1, 5, string("hello"), 't', vector<int>{1,2,3,4,5});
    cout << tup.getItem<2>();
    return 0;
}